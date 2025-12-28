'use server'

import { createClerkSupabaseClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"
import { cookies } from "next/headers"

/**
 * Migrate guest cart to user cart after login
 */
export async function migrateGuestCart(guestCartId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }
    
    // Update cart to associate with user
    const { error } = await supabase
      .from('carts')
      .update({ 
        clerk_user_id: userId, 
        guest_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', guestCartId)
    
    if (error) {
      console.error('Error migrating guest cart:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in migrateGuestCart:', error)
    return { success: false, error: error.message || 'Failed to migrate cart' }
  }
}

/**
 * Validate cart item against inventory
 */
export async function validateCartInventory(cartId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    
    // Get cart items with product inventory
    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products!product_id(stock_quantity, name)
      `)
      .eq('cart_id', cartId)
    
    if (error) {
      console.error('Error validating cart inventory:', error)
      return { 
        success: false, 
        valid: false,
        error: error.message 
      }
    }
    
    const issues = items?.filter(item => {
      const stock = item.product?.stock_quantity || 0
      return item.quantity > stock
    })
    
    return {
      success: true,
      valid: issues?.length === 0,
      issues: issues?.map(i => ({
        itemId: i.id,
        productName: i.product?.name || i.title,
        requested: i.quantity,
        available: i.product?.stock_quantity || 0
      }))
    }
  } catch (error: any) {
    console.error('Error in validateCartInventory:', error)
    return { 
      success: false, 
      valid: false,
      error: error.message || 'Failed to validate inventory' 
    }
  }
}

/**
 * Clear cart after order completion
 */
export async function clearCart(cartId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    
    // Delete all items
    const { error: itemsError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
    
    if (itemsError) {
      console.error('Error deleting cart items:', itemsError)
      return { success: false, error: itemsError.message }
    }
    
    // Mark cart as completed
    const { error: cartError } = await supabase
      .from('carts')
      .update({ 
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId)
    
    if (cartError) {
      console.error('Error marking cart as completed:', cartError)
      return { success: false, error: cartError.message }
    }
    
    // Clear cart cookie
    const cookieStore = await cookies()
    cookieStore.delete('cart_id')
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in clearCart:', error)
    return { success: false, error: error.message || 'Failed to clear cart' }
  }
}

/**
 * Get cart totals with tax calculation
 */
export async function getCartTotals(cartId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    
    // Get cart items
    const { data: items, error } = await supabase
      .from('cart_items')
      .select('quantity, unit_price')
      .eq('cart_id', cartId)
    
    if (error) {
      console.error('Error getting cart totals:', error)
      return { success: false, error: error.message }
    }
    
    const subtotal = items?.reduce((sum, item) => 
      sum + (item.unit_price * item.quantity), 0
    ) || 0
    
    // Calculate tax (18% GST)
    const tax = subtotal * 0.18
    
    // Calculate shipping (free over ₹5000)
    const shippingCost = subtotal > 5000 ? 0 : 100
    
    const total = subtotal + tax + shippingCost
    
    return {
      success: true,
      totals: {
        subtotal,
        tax,
        shippingCost,
        total,
        itemCount: items?.length || 0
      }
    }
  } catch (error: any) {
    console.error('Error in getCartTotals:', error)
    return { success: false, error: error.message || 'Failed to get cart totals' }
  }
}

/**
 * Sync cart between devices for authenticated users
 */
export async function syncCart() {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const cookieStore = await cookies()
    const guestCartId = cookieStore.get('cart_id')?.value
    
    if (!guestCartId) {
      return { success: true, message: 'No guest cart to sync' }
    }
    
    // Check if user already has a cart
    const { data: userCart } = await supabase
      .from('carts')
      .select('id')
      .eq('clerk_user_id', userId)
      .is('completed_at', null)
      .single()
    
    if (userCart) {
      // Merge guest cart items into user cart
      const { data: guestItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', guestCartId)
      
      if (guestItems && guestItems.length > 0) {
        // Update cart_id for all guest items
        await supabase
          .from('cart_items')
          .update({ cart_id: userCart.id })
          .eq('cart_id', guestCartId)
        
        // Delete empty guest cart
        await supabase
          .from('carts')
          .delete()
          .eq('id', guestCartId)
      }
      
      // Update cookie with user cart
      cookieStore.set('cart_id', userCart.id)
      
      return { success: true, message: 'Cart synced successfully' }
    } else {
      // Just associate guest cart with user
      return migrateGuestCart(guestCartId)
    }
  } catch (error: any) {
    console.error('Error in syncCart:', error)
    return { success: false, error: error.message || 'Failed to sync cart' }
  }
}
