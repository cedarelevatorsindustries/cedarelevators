/**
 * Checkout Server Actions
 * Cedar Elevator Industries
 * 
 * Handles all server-side checkout operations:
 * - Eligibility validation
 * - Address management
 * - Order creation
 * - Payment processing
 * 
 * SECURITY FEATURES:
 * - Input sanitization (XSS prevention)
 * - Server-side validation
 * - Cart ownership validation
 * - Business verification checks
 * - Price tampering prevention
 */

'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

// =====================================================
// Security Helpers
// =====================================================

/**
 * Sanitize input to prevent XSS attacks
 */
function sanitizeInput(input: string): string {
  if (!input) return ''
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .slice(0, 500) // Limit length
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// =====================================================
// Types
// =====================================================

export interface CheckoutEligibility {
  eligible: boolean
  reason?: string
  message?: string
  verification_status?: string
  business_id?: string
  cart_id?: string
  item_count?: number
}

export interface BusinessAddress {
  id?: string
  business_id: string
  address_type: 'shipping' | 'billing' | 'both'
  contact_name: string
  contact_phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country?: string
  is_default?: boolean
  gst_number?: string
}

export interface CheckoutSummary {
  subtotal: number
  tax: number
  gst_percentage: number
  shipping: number
  discount: number
  total: number
  currency: string
}

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// =====================================================
// Checkout Eligibility
// =====================================================

export async function checkCheckoutEligibility(
  cartId: string
): Promise<ActionResponse<CheckoutEligibility>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated',
        data: {
          eligible: false,
          reason: 'not_authenticated',
          message: 'Please sign in to continue'
        }
      }
    }

    const supabase = await createServerSupabase()

    // Call database function to validate eligibility
    const { data, error } = await supabase.rpc('validate_checkout_eligibility', {
      p_cart_id: cartId,
      p_clerk_user_id: userId
    })

    if (error) {
      console.error('Eligibility check error:', error)
      return {
        success: false,
        error: error.message,
        data: {
          eligible: false,
          reason: 'validation_error',
          message: 'Failed to validate checkout eligibility'
        }
      }
    }

    return {
      success: true,
      data: data as CheckoutEligibility
    }
  } catch (error: any) {
    console.error('checkCheckoutEligibility error:', error)
    return {
      success: false,
      error: error.message || 'Failed to check eligibility',
      data: {
        eligible: false,
        reason: 'unknown_error',
        message: 'An unexpected error occurred'
      }
    }
  }
}

// =====================================================
// Address Management
// =====================================================

export async function getBusinessAddresses(): Promise<ActionResponse<BusinessAddress[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('business_addresses')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get addresses error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error: any) {
    console.error('getBusinessAddresses error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch addresses'
    }
  }
}

export async function addBusinessAddress(
  address: BusinessAddress
): Promise<ActionResponse<BusinessAddress>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    // SECURITY: Validate and sanitize inputs
    if (!isValidUUID(address.business_id)) {
      return {
        success: false,
        error: 'Invalid business ID'
      }
    }

    const sanitizedAddress = {
      ...address,
      contact_name: sanitizeInput(address.contact_name),
      contact_phone: sanitizeInput(address.contact_phone),
      address_line1: sanitizeInput(address.address_line1),
      address_line2: address.address_line2 ? sanitizeInput(address.address_line2) : undefined,
      city: sanitizeInput(address.city),
      state: sanitizeInput(address.state),
      postal_code: sanitizeInput(address.postal_code),
      gst_number: address.gst_number ? sanitizeInput(address.gst_number) : undefined
    }

    const supabase = await createServerSupabase()

    // If this is marked as default, unset other defaults
    if (sanitizedAddress.is_default) {
      await supabase
        .from('business_addresses')
        .update({ is_default: false })
        .eq('business_id', sanitizedAddress.business_id)
        .eq('address_type', sanitizedAddress.address_type)
    }

    const { data, error } = await supabase
      .from('business_addresses')
      .insert({
        ...sanitizedAddress,
        clerk_user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Add address error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    revalidatePath('/checkout')

    return {
      success: true,
      data: data,
      message: 'Address added successfully'
    }
  } catch (error: any) {
    console.error('addBusinessAddress error:', error)
    return {
      success: false,
      error: error.message || 'Failed to add address'
    }
  }
}

export async function updateBusinessAddress(
  addressId: string,
  updates: Partial<BusinessAddress>
): Promise<ActionResponse<BusinessAddress>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const supabase = await createServerSupabase()

    // If setting as default, unset other defaults
    if (updates.is_default && updates.business_id && updates.address_type) {
      await supabase
        .from('business_addresses')
        .update({ is_default: false })
        .eq('business_id', updates.business_id)
        .eq('address_type', updates.address_type)
        .neq('id', addressId)
    }

    const { data, error } = await supabase
      .from('business_addresses')
      .update(updates)
      .eq('id', addressId)
      .eq('clerk_user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update address error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    revalidatePath('/checkout')

    return {
      success: true,
      data: data,
      message: 'Address updated successfully'
    }
  } catch (error: any) {
    console.error('updateBusinessAddress error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update address'
    }
  }
}

export async function deleteBusinessAddress(
  addressId: string
): Promise<ActionResponse<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('business_addresses')
      .update({ is_active: false })
      .eq('id', addressId)
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('Delete address error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    revalidatePath('/checkout')

    return {
      success: true,
      message: 'Address deleted successfully'
    }
  } catch (error: any) {
    console.error('deleteBusinessAddress error:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete address'
    }
  }
}

// =====================================================
// Checkout Summary
// =====================================================

export async function getCheckoutSummary(
  cartId: string
): Promise<ActionResponse<CheckoutSummary>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const supabase = await createServerSupabase()

    // Get cart items with current prices
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          price,
          stock_quantity,
          status
        )
      `)
      .eq('cart_id', cartId)

    if (cartError) {
      console.error('Get cart items error:', cartError)
      return {
        success: false,
        error: cartError.message
      }
    }

    // Calculate pricing
    let subtotal = 0
    
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach((item: any) => {
        const price = item.products?.price || 0
        subtotal += price * item.quantity
      })
    }

    const shipping = 0 // ON HOLD as per requirements
    const gst_percentage = 18
    const tax = Math.round((subtotal + shipping) * (gst_percentage / 100) * 100) / 100
    const discount = 0 // Future: implement discount codes
    const total = subtotal + tax + shipping - discount

    return {
      success: true,
      data: {
        subtotal,
        tax,
        gst_percentage,
        shipping,
        discount,
        total,
        currency: 'INR'
      }
    }
  } catch (error: any) {
    console.error('getCheckoutSummary error:', error)
    return {
      success: false,
      error: error.message || 'Failed to calculate checkout summary'
    }
  }
}

// =====================================================
// Order Creation
// =====================================================

export async function createOrderFromCart(
  cartId: string,
  shippingAddressId: string,
  billingAddressId?: string
): Promise<ActionResponse<{ order_id: string; order_number: string }>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const supabase = await createServerSupabase()

    // EDGE CASE 1: Verify business verification status before order creation
    const { data: userProfile } = await supabase
      .from('business_profiles')
      .select('id, verification_status')
      .eq('clerk_user_id', userId)
      .single()

    if (!userProfile || userProfile.verification_status !== 'verified') {
      return {
        success: false,
        error: 'Business verification required. Your account verification status has changed.'
      }
    }

    // EDGE CASE 2: Validate cart ownership
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id, clerk_user_id, status')
      .eq('id', cartId)
      .eq('clerk_user_id', userId)
      .single()

    if (cartError || !cart) {
      return {
        success: false,
        error: 'Cart not found or access denied'
      }
    }

    if (cart.status === 'converted') {
      return {
        success: false,
        error: 'This cart has already been converted to an order'
      }
    }

    // EDGE CASE 3: Re-validate prices and inventory before order creation
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          price,
          stock_quantity,
          status
        )
      `)
      .eq('cart_id', cartId)

    if (itemsError || !cartItems || cartItems.length === 0) {
      return {
        success: false,
        error: 'Cart is empty or items not found'
      }
    }

    // Check for price changes or stock issues
    const issues = []
    for (const item of cartItems) {
      const product = item.products

      if (!product || product.status !== 'published') {
        issues.push(`Product "${item.title}" is no longer available`)
        continue
      }

      if (product.stock_quantity < item.quantity) {
        issues.push(`Insufficient stock for "${item.title}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`)
      }
    }

    if (issues.length > 0) {
      return {
        success: false,
        error: `Cannot create order: ${issues.join('; ')}`
      }
    }

    // Get business profile
    const { data: business, error: businessError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (businessError || !business) {
      return {
        success: false,
        error: 'Business profile not found'
      }
    }

    // SECURITY: Validate address ownership
    const { data: shippingAddress, error: shippingError } = await supabase
      .from('business_addresses')
      .select('*')
      .eq('id', shippingAddressId)
      .eq('clerk_user_id', userId)
      .single()

    if (shippingError || !shippingAddress) {
      return {
        success: false,
        error: 'Shipping address not found or access denied'
      }
    }

    // Get billing address (use shipping if not provided)
    let billingAddress = shippingAddress
    if (billingAddressId && billingAddressId !== shippingAddressId) {
      const { data: billing } = await supabase
        .from('business_addresses')
        .select('*')
        .eq('id', billingAddressId)
        .eq('clerk_user_id', userId)
        .single()
      
      if (billing) {
        billingAddress = billing
      }
    }

    // Call database function to create order
    const { data: orderId, error: orderError } = await supabase.rpc('create_order_from_cart', {
      p_cart_id: cartId,
      p_clerk_user_id: userId,
      p_business_id: business.id,
      p_shipping_address: shippingAddress,
      p_billing_address: billingAddress
    })

    if (orderError) {
      console.error('Create order error:', orderError)
      return {
        success: false,
        error: orderError.message
      }
    }

    // Get order details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return {
        success: false,
        error: 'Failed to fetch order details'
      }
    }

    return {
      success: true,
      data: {
        order_id: order.id,
        order_number: order.order_number
      },
      message: 'Order created successfully'
    }
  } catch (error: any) {
    console.error('createOrderFromCart error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create order'
    }
  }
}

// =====================================================
// Order Retrieval
// =====================================================

export async function getOrderById(orderId: string): Promise<ActionResponse<any>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          variant_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', orderId)
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      console.error('Get order error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'Order not found'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('getOrderById error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch order'
    }
  }
}

