/**
 * Cart Server Actions - Core CRUD Operations
 * Cedar Elevator Industries
 * 
 * Handles all server-side cart operations:
 * - Get/create carts per profile
 * - Add/update/remove items
 * - Cart ownership validation
 * - Profile switching
 */

'use server'

import { createClerkSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import {
  Cart,
  CartItem,
  CartOwnership,
  ProfileType,
  CartActionResponse,
  AddToCartPayload,
  UpdateCartItemPayload,
  CartContext,
  UserType
} from '@/types/cart.types'
import { logger } from '@/lib/services/logger'

// =====================================================
// Helper: Get User Context (Optimized with parallel queries)
// =====================================================

async function getUserContext(): Promise<CartContext | null> {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = await createClerkSupabaseClient()

  // Run both queries in parallel for better performance
  const [customerMetaResult, businessProfileResult] = await Promise.all([
    supabase
      .from('customer_meta')
      .select('user_type')
      .eq('clerk_user_id', userId)
      .single(),
    supabase
      .from('business_profiles')
      .select('id, verification_status')
      .eq('clerk_user_id', userId)
      .single()
  ])

  const customerMeta = customerMetaResult.data
  const businessProfile = businessProfileResult.data

  const profileType: ProfileType = customerMeta?.user_type === 'business' ? 'business' : 'individual'

  let userType: UserType
  if (!businessProfile) {
    userType = 'individual'
  } else if (businessProfile.verification_status === 'verified') {
    userType = 'business_verified'
  } else {
    userType = 'business_unverified'
  }

  return {
    userId,
    profileType,
    businessId: businessProfile?.id,
    userType,
    isVerified: userType === 'business_verified'
  }
}


// =====================================================
// Get or Create Active Cart
// =====================================================

export async function getOrCreateCart(
  profileType?: ProfileType,
  businessId?: string
): Promise<CartActionResponse<Cart>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    const profile = profileType || context.profileType
    const bizId = businessId || context.businessId

    // Call database function to get or create cart
    const { data, error } = await supabase.rpc('get_or_create_cart', {
      p_clerk_user_id: context.userId,
      p_profile_type: profile,
      p_business_id: bizId || null
    })

    if (error) {
      logger.error('Error getting/creating cart', {
        error,
        userId: context.userId,
        profileType: profile,
        businessId: bizId
      })
      return { success: false, error: `Failed to get or create cart: ${error.message || 'Unknown error'}` }
    }

    // Fetch the cart with items
    const cart = await getCart(data)
    return { success: true, data: cart.data || undefined }

  } catch (error) {
    logger.error('getOrCreateCart error', error)
    return { success: false, error: 'Failed to get or create cart' }
  }
}

// =====================================================
// Get Cart by ID
// =====================================================

export async function getCart(cartId: string): Promise<CartActionResponse<Cart>> {
  try {
    const supabase = await createClerkSupabaseClient()

    const { data: cart, error } = await supabase
      .from('carts')
      .select(`
        *,
        items:cart_items(*)
      `)
      .eq('id', cartId)
      .eq('status', 'active')
      .single()

    if (error || !cart) {
      return { success: false, error: 'Cart not found' }
    }

    return { success: true, data: cart as Cart }

  } catch (error) {
    logger.error('getCart error', error)
    return { success: false, error: 'Failed to get cart' }
  }
}

// =====================================================
// Get User's Active Cart
// =====================================================

export async function getUserActiveCart(
  profileType?: ProfileType,
  businessId?: string
): Promise<CartActionResponse<Cart>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    const profile = profileType || context.profileType

    // Build query - Note: business_id column may not exist in carts table
    // We filter by clerk_user_id and profile_type only
    const { data: cart, error } = await supabase
      .from('carts')
      .select(`
        *,
        items:cart_items(*)
      `)
      .eq('clerk_user_id', context.userId)
      .eq('profile_type', profile)
      .eq('status', 'active')
      .maybeSingle()

    if (error) {
      logger.error('getUserActiveCart error', error)
      return { success: false, error: 'Failed to get active cart' }
    }

    if (!cart) {
      // No active cart found, create one
      return await getOrCreateCart(profile, businessId)
    }

    return { success: true, data: cart as Cart }

  } catch (error) {
    logger.error('getUserActiveCart error', error)
    return { success: false, error: 'Failed to get active cart' }
  }
}

// =====================================================
// Switch Cart Context (Profile Switching)
// =====================================================

export async function switchCartContext(
  newProfileType: ProfileType,
  newBusinessId?: string
): Promise<CartActionResponse<Cart>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    // Call database function to switch context
    const { data, error } = await supabase.rpc('switch_cart_context', {
      p_clerk_user_id: context.userId,
      p_new_profile_type: newProfileType,
      p_new_business_id: newBusinessId || null
    })

    if (error) {
      logger.error('switchCartContext error', error)
      return { success: false, error: 'Failed to switch cart context' }
    }

    // Fetch the cart
    const cart = await getCart(data)
    return {
      success: true,
      data: cart.data,
      message: `Switched to ${newProfileType} cart`
    }

  } catch (error) {
    logger.error('switchCartContext error', error)
    return { success: false, error: 'Failed to switch cart context' }
  }
}

// =====================================================
// Add Item to Cart
// =====================================================

export async function addItemToCart(
  payload: AddToCartPayload
): Promise<CartActionResponse<CartItem>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: false, error: 'User not authenticated' }
    }

    const adminClient = createAdminClient() // Use admin client to bypass RLS

    // Get or create active cart
    const cartResult = await getUserActiveCart()
    if (!cartResult.success || !cartResult.data) {
      return { success: false, error: 'Failed to get cart' }
    }

    const cartId = cartResult.data.id

    // Validate product exists and get details (using admin client)
    const { data: product, error: productError } = await adminClient
      .from('products')
      .select('id, name, slug, thumbnail_url, status, stock_quantity, price')
      .eq('id', payload.productId)
      .single()

    if (productError || !product) {
      logger.error('Product lookup failed', { productId: payload.productId, error: productError })
      return { success: false, error: 'Product not found' }
    }

    if (product.status !== 'active') {
      return { success: false, error: 'Product is not available' }
    }

    // Stock check is optional (some products may not have stock tracking)
    if (product.stock_quantity !== null && product.stock_quantity < payload.quantity) {
      return { success: false, error: 'Insufficient stock' }
    }

    // Get unit price (from product or variant)
    let unitPrice = Number(product.price) || 0

    // If variant is specified, try to get variant price
    if (payload.variantId) {
      const { data: variant } = await adminClient
        .from('product_variants')
        .select('price')
        .eq('id', payload.variantId)
        .single()

      if (variant?.price) {
        unitPrice = Number(variant.price)
      }
    }

    // Check if item already exists in cart (using admin client)
    const { data: existingItem } = await adminClient
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', payload.productId)
      .eq('variant_id', payload.variantId || null)
      .maybeSingle()

    let cartItem: CartItem

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + payload.quantity

      if (product.stock_quantity !== null && product.stock_quantity < newQuantity) {
        return { success: false, error: 'Insufficient stock for requested quantity' }
      }

      const { data, error } = await adminClient
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) {
        logger.error('Error updating cart item', error)
        return { success: false, error: 'Failed to update cart item' }
      }

      cartItem = data as CartItem
    } else {
      // Add new item (using admin client)
      const { data, error } = await adminClient
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: payload.productId,
          variant_id: payload.variantId || null,
          title: product.name,
          thumbnail: product.thumbnail_url,
          quantity: payload.quantity,
          unit_price: unitPrice
        })
        .select()
        .single()

      if (error) {
        logger.error('Error adding cart item', error)
        return { success: false, error: 'Failed to add item to cart' }
      }

      cartItem = data as CartItem
    }

    // Update cart updated_at (using admin client)
    await adminClient
      .from('carts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cartId)

    return {
      success: true,
      data: cartItem,
      message: 'Item added to cart'
    }

  } catch (error) {
    logger.error('addItemToCart error', {
      error,
      productId: payload.productId,
      variantId: payload.variantId,
      quantity: payload.quantity
    })
    return { success: false, error: `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// =====================================================
// Update Cart Item Quantity
// =====================================================

export async function updateCartItemQuantity(
  payload: UpdateCartItemPayload
): Promise<CartActionResponse<CartItem>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: false, error: 'User not authenticated' }
    }

    if (payload.quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' }
    }

    const supabase = await createClerkSupabaseClient()

    // Verify ownership
    const { data: cartItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('*, cart:carts!inner(clerk_user_id, status)')
      .eq('id', payload.cartItemId)
      .single()

    if (fetchError || !cartItem) {
      return { success: false, error: 'Cart item not found' }
    }

    const cart = Array.isArray(cartItem.cart) ? cartItem.cart[0] : cartItem.cart

    if (cart.clerk_user_id !== context.userId) {
      return { success: false, error: 'Unauthorized' }
    }

    if (cart.status !== 'active') {
      return { success: false, error: 'Cart is not active' }
    }

    // Check stock
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', cartItem.product_id)
      .single()

    if (product && product.stock_quantity < payload.quantity) {
      return { success: false, error: 'Insufficient stock' }
    }

    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: payload.quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.cartItemId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating cart item quantity', error)
      return { success: false, error: 'Failed to update quantity' }
    }

    return {
      success: true,
      data: data as CartItem,
      message: 'Quantity updated'
    }

  } catch (error) {
    logger.error('updateCartItemQuantity error', error)
    return { success: false, error: 'Failed to update quantity' }
  }
}

// =====================================================
// Remove Cart Item
// =====================================================

export async function removeCartItem(cartItemId: string): Promise<CartActionResponse<void>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    // Verify ownership
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('cart:carts!inner(clerk_user_id)')
      .eq('id', cartItemId)
      .single()

    if (!cartItem) {
      return { success: false, error: 'Unauthorized' }
    }

    const cart = Array.isArray(cartItem.cart) ? cartItem.cart[0] : cartItem.cart

    if (cart.clerk_user_id !== context.userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete item
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) {
      logger.error('Error removing cart item', error)
      return { success: false, error: 'Failed to remove item' }
    }

    return {
      success: true,
      message: 'Item removed from cart'
    }

  } catch (error) {
    logger.error('removeCartItem error', error)
    return { success: false, error: 'Failed to remove item' }
  }
}

// =====================================================
// Clear Cart
// =====================================================

export async function clearCart(cartId?: string): Promise<CartActionResponse<void>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    // Get cart ID if not provided
    let targetCartId = cartId
    if (!targetCartId) {
      const cartResult = await getUserActiveCart()
      if (!cartResult.success || !cartResult.data) {
        return { success: false, error: 'Failed to get cart' }
      }
      targetCartId = cartResult.data.id
    }

    // Verify ownership
    const { data: cart } = await supabase
      .from('carts')
      .select('clerk_user_id')
      .eq('id', targetCartId)
      .single()

    if (!cart || cart.clerk_user_id !== context.userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete all items
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', targetCartId)

    if (error) {
      logger.error('Error clearing cart', error)
      return { success: false, error: 'Failed to clear cart' }
    }

    return {
      success: true,
      message: 'Cart cleared'
    }

  } catch (error) {
    logger.error('clearCart error', error)
    return { success: false, error: 'Failed to clear cart' }
  }
}

// =====================================================
// Abandon Cart
// =====================================================

export async function abandonCart(cartId: string): Promise<CartActionResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClient()

    const { error } = await supabase
      .from('carts')
      .update({
        status: 'abandoned',
        abandoned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId)

    if (error) {
      logger.error('Error abandoning cart', error)
      return { success: false, error: 'Failed to abandon cart' }
    }

    return { success: true }

  } catch (error) {
    logger.error('abandonCart error', error)
    return { success: false, error: 'Failed to abandon cart' }
  }
}

// =====================================================
// Convert Cart (to Order or Quote)
// =====================================================

export async function convertCart(
  cartId: string,
  type: 'order' | 'quote'
): Promise<CartActionResponse<void>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    // Verify ownership
    const { data: cart } = await supabase
      .from('carts')
      .select('clerk_user_id')
      .eq('id', cartId)
      .single()

    if (!cart || cart.clerk_user_id !== context.userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Mark as converted
    const { error } = await supabase
      .from('carts')
      .update({
        status: 'converted',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId)

    if (error) {
      logger.error('Error converting cart', error)
      return { success: false, error: 'Failed to convert cart' }
    }

    return {
      success: true,
      message: `Cart converted to ${type}`
    }

  } catch (error) {
    logger.error('convertCart error', error)
    return { success: false, error: 'Failed to convert cart' }
  }
}

// =====================================================
// Get Cart Item Count
// =====================================================

export async function getCartItemCount(): Promise<CartActionResponse<number>> {
  try {
    const context = await getUserContext()
    if (!context) {
      return { success: true, data: 0 }
    }

    const cartResult = await getUserActiveCart()
    if (!cartResult.success || !cartResult.data) {
      return { success: true, data: 0 }
    }

    const itemCount = cartResult.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

    return { success: true, data: itemCount }

  } catch (error) {
    logger.error('getCartItemCount error', error)
    return { success: true, data: 0 }
  }
}

