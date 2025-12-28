'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { getCart } from './cart'
import { clearCart } from './cart-extended'
import type { OrderWithDetails } from '@/lib/types/orders'

interface CreateOrderInput {
  cartId: string
  shippingAddress: {
    name: string
    email?: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
  }
  billingAddress?: any // Same structure as shipping
  paymentMethod: 'cod' | 'razorpay' | 'upi'
  notes?: string
}

export async function createOrderFromCart(input: CreateOrderInput): Promise<{
  success: boolean
  order?: OrderWithDetails
  razorpayOrderId?: string
  error?: string
}> {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    // 1. Get cart with items
    const cart = await getCart(input.cartId)
    if (!cart || !cart.items || cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }
    
    // 2. Validate inventory
    for (const item of cart.items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', item.product_id)
        .single()
      
      if (!product || product.stock_quantity < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for ${product?.name || item.title}` 
        }
      }
    }
    
    // 3. Calculate totals
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.unit_price * item.quantity), 0
    )
    const tax = subtotal * 0.18 // 18% GST
    const shippingCost = subtotal > 5000 ? 0 : 100 // Free shipping over ₹5000
    const totalAmount = subtotal + tax + shippingCost
    
    // 4. Generate order number
    const { data: seqData } = await supabase
      .rpc('nextval', { sequence_name: 'order_number_seq' })
      .single()
    
    const orderNumber = `CE-${String(seqData || Date.now()).padStart(6, '0')}`
    
    // 5. Create Razorpay order if payment method is razorpay
    let razorpayOrderId
    if (input.paymentMethod === 'razorpay') {
      // Razorpay order will be created via API route
      // This is a placeholder that will be updated
      razorpayOrderId = 'pending'
    }
    
    // 6. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        clerk_user_id: userId || null,
        guest_email: !userId ? input.shippingAddress.email : null,
        guest_name: !userId ? input.shippingAddress.name : null,
        order_status: 'pending',
        payment_status: input.paymentMethod === 'cod' ? 'pending' : 'pending',
        payment_method: input.paymentMethod,
        razorpay_order_id: razorpayOrderId,
        subtotal: subtotal,
        tax: tax,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        shipping_address: input.shippingAddress,
        billing_address: input.billingAddress || input.shippingAddress,
        notes: input.notes
      })
      .select()
      .single()
    
    if (orderError) {
      console.error('Error creating order:', orderError)
      throw orderError
    }
    
    // 7. Create order items
    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      throw itemsError
    }
    
    // 8. Decrement inventory
    for (const item of cart.items) {
      const { error: invError } = await supabase
        .rpc('decrement_inventory', {
          product_id: item.product_id,
          quantity: item.quantity
        })
      
      if (invError) {
        console.error('Error decrementing inventory:', invError)
        // Continue even if inventory update fails
      }
    }
    
    // 9. Clear cart
    await clearCart(input.cartId)
    
    // 10. Fetch complete order
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', order.id)
      .single()
    
    return {
      success: true,
      order: completeOrder as OrderWithDetails,
      razorpayOrderId
    }
    
  } catch (error: any) {
    console.error('Error creating order:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to create order' 
    }
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(limit?: number) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data: orders, error } = await query
    
    if (error) {
      console.error('Error fetching user orders:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, orders: orders as OrderWithDetails[] }
  } catch (error: any) {
    console.error('Error in getUserOrders:', error)
    return { success: false, error: error.message || 'Failed to fetch orders' }
  }
}

/**
 * Confirm COD order
 */
export async function confirmCODOrder(orderId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('clerk_user_id', userId)
    
    if (error) {
      console.error('Error confirming COD order:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in confirmCODOrder:', error)
    return { success: false, error: error.message || 'Failed to confirm order' }
  }
}
