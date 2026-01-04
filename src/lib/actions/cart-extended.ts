'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { getCart } from './cart'

/**
 * Migrate guest cart to user cart after login
 * This ensures cart items are preserved when user signs in
 */
export async function migrateGuestCart(guestCartId: string) {
  console.log('🔄 [Cart Migration] Starting guest cart migration:', guestCartId)
  
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      console.log('❌ [Cart Migration] No user ID found, cannot migrate')
      return { success: false, error: 'User not authenticated' }
    }

    console.log('👤 [Cart Migration] User ID:', userId)
    
    // Check if user already has a cart
    const { data: existingUserCart } = await supabase
      .from('carts')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (existingUserCart) {
      console.log('📦 [Cart Migration] User already has cart:', existingUserCart.id)
      
      // Merge guest cart items into user cart
      const { data: guestItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', guestCartId)

      if (guestItems && guestItems.length > 0) {
        console.log(`🔀 [Cart Migration] Merging ${guestItems.length} items from guest cart`)
        
        for (const item of guestItems) {
          // Check if item already exists in user cart
          const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', existingUserCart.id)
            .eq('variant_id', item.variant_id)
            .single()

          if (existingItem) {
            // Update quantity
            console.log(`➕ [Cart Migration] Updating existing item quantity`)
            await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + item.quantity })
              .eq('id', existingItem.id)
          } else {
            // Insert new item
            console.log(`✨ [Cart Migration] Adding new item to user cart`)
            await supabase
              .from('cart_items')
              .insert({
                ...item,
                id: undefined,
                cart_id: existingUserCart.id,
              })
          }
        }

        // Delete guest cart
        await supabase
          .from('carts')
          .delete()
          .eq('id', guestCartId)

        console.log('✅ [Cart Migration] Migration complete, guest cart deleted')
      }
    } else {
      // Simply update guest cart to associate with user
      console.log('🔗 [Cart Migration] Associating guest cart with user')
      
      const { error } = await supabase
        .from('carts')
        .update({ clerk_user_id: userId, guest_id: null })
        .eq('id', guestCartId)
      
      if (error) {
        console.error('❌ [Cart Migration] Error:', error)
        throw error
      }

      console.log('✅ [Cart Migration] Cart successfully associated with user')
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('❌ [Cart Migration] Failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Validate cart items against current inventory
 * Returns validation status and any issues found
 */
export async function validateCartInventory(cartId: string) {
  console.log('🔍 [Cart Validation] Validating inventory for cart:', cartId)
  
  try {
    const supabase = await createClerkSupabaseClient()
    
    // Get cart items
    const { data: items, error } = await supabase
      .from('cart_items')
      .select('id, variant_id, product_id, quantity, title')
      .eq('cart_id', cartId)
    
    if (error) throw error
    
    if (!items || items.length === 0) {
      console.log('✅ [Cart Validation] Cart is empty, validation passed')
      return { valid: true, issues: [] }
    }

    console.log(`📋 [Cart Validation] Validating ${items.length} items`)
    
    const issues = []
    
    for (const item of items) {
      // Try variant first, then product
      let available = 0
      
      if (item.variant_id) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('inventory_quantity')
          .eq('id', item.variant_id)
          .single()
        
        available = variant?.inventory_quantity || 0
      } else if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()
        
        available = product?.stock_quantity || 0
      }
      
      if (item.quantity > available) {
        console.log(`⚠️  [Cart Validation] Insufficient stock for "${item.title}": requested ${item.quantity}, available ${available}`)
        issues.push({
          itemId: item.id,
          title: item.title,
          requested: item.quantity,
          available: available
        })
      }
    }
    
    const isValid = issues.length === 0
    console.log(isValid ? '✅ [Cart Validation] All items validated successfully' : `❌ [Cart Validation] Found ${issues.length} issues`)
    
    return {
      valid: isValid,
      issues: issues
    }
  } catch (error: any) {
    console.error('❌ [Cart Validation] Error:', error)
    return {
      valid: false,
      issues: [],
      error: error.message
    }
  }
}

/**
 * Clear cart after successful order
 * Marks cart as completed instead of deleting
 */
export async function clearCart(cartId: string) {
  console.log('🧹 [Cart Clear] Clearing cart:', cartId)
  
  try {
    const supabase = await createClerkSupabaseClient()
    
    // Delete all items
    const { error: itemsError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
    
    if (itemsError) throw itemsError
    
    console.log('🗑️  [Cart Clear] Cart items deleted')
    
    // Mark cart as completed
    const { error: cartError } = await supabase
      .from('carts')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', cartId)
    
    if (cartError) throw cartError
    
    console.log('✅ [Cart Clear] Cart marked as completed')
    
    return { success: true }
  } catch (error: any) {
    console.error('❌ [Cart Clear] Error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get cart summary for checkout
 * Calculates all totals including tax and shipping
 */
export async function getCartSummary(cartId: string) {
  console.log('💰 [Cart Summary] Calculating summary for cart:', cartId)
  
  try {
    const cart = await getCart(cartId)
    
    if (!cart || !cart.items || cart.items.length === 0) {
      console.log('⚠️  [Cart Summary] Cart is empty')
      return {
        success: false,
        error: 'Cart is empty'
      }
    }
    
    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity)
    }, 0)
    
    // Calculate tax (18% GST for India)
    const tax = subtotal * 0.18
    
    // Calculate shipping (free over ₹5000)
    const shippingCost = subtotal > 5000 ? 0 : 100
    
    // Calculate total
    const total = subtotal + tax + shippingCost
    
    console.log('💵 [Cart Summary] Subtotal:', subtotal.toFixed(2))
    console.log('💵 [Cart Summary] Tax (18%):', tax.toFixed(2))
    console.log('💵 [Cart Summary] Shipping:', shippingCost.toFixed(2))
    console.log('💵 [Cart Summary] Total:', total.toFixed(2))
    
    return {
      success: true,
      summary: {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shippingCost: Number(shippingCost.toFixed(2)),
        discount: 0,
        total: Number(total.toFixed(2)),
        itemCount: cart.items.length,
        items: cart.items
      }
    }
  } catch (error: any) {
    console.error('❌ [Cart Summary] Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

