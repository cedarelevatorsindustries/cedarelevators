'use server'

import { createClerkSupabaseClient, createServerSupabase } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { getCart, clearCart } from './cart'
import { validateCartInventory, getCartSummary } from './cart-extended'
import { sendOrderConfirmation } from '@/lib/services/email'
import { sendOrderNotification } from './notifications'
import type { OrderWithDetails } from '@/lib/types/orders'

interface ShippingAddress {
  name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  email?: string
}

interface CreateOrderInput {
  cartId: string
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  paymentMethod: 'cod' | 'razorpay' | 'upi'
  notes?: string
}

interface CreateOrderResult {
  success: boolean
  order?: OrderWithDetails
  razorpayOrderId?: string
  error?: string
}

/**
 * Create order from cart
 * This is the main function for checkout completion
 */
export async function createOrderFromCart(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  console.log('🛒 [Order Creation] Starting order creation process')
  console.log('🛒 [Order Creation] Cart ID:', input.cartId)
  console.log('🛒 [Order Creation] Payment method:', input.paymentMethod)
  
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    console.log('👤 [Order Creation] User ID:', userId || 'Guest')
    
    // 1. Get cart with items
    console.log('📦 [Order Creation] Step 1: Fetching cart')
    const cart = await getCart(input.cartId)
    
    if (!cart || !cart.items || cart.items.length === 0) {
      console.log('❌ [Order Creation] Cart is empty')
      return { success: false, error: 'Cart is empty' }
    }
    
    console.log(`📋 [Order Creation] Cart has ${cart.items.length} items`)
    
    // 2. Validate inventory
    console.log('🔍 [Order Creation] Step 2: Validating inventory')
    const validation = await validateCartInventory(input.cartId)
    
    if (!validation.valid) {
      console.log('❌ [Order Creation] Inventory validation failed')
      console.log('⚠️  [Order Creation] Issues:', validation.issues)
      
      const issueMessages = validation.issues
        .map(i => `${i.title}: requested ${i.requested}, available ${i.available}`)
        .join(', ')
      
      return {
        success: false,
        error: `Insufficient stock for: ${issueMessages}`
      }
    }
    
    console.log('✅ [Order Creation] Inventory validated successfully')
    
    // 3. Calculate totals
    console.log('💰 [Order Creation] Step 3: Calculating totals')
    const summaryResult = await getCartSummary(input.cartId)
    
    if (!summaryResult.success || !summaryResult.summary) {
      console.log('❌ [Order Creation] Failed to calculate cart summary')
      return { success: false, error: 'Failed to calculate order totals' }
    }
    
    const { subtotal, tax, shippingCost, total } = summaryResult.summary
    
    console.log('💵 [Order Creation] Subtotal: ₹', subtotal)
    console.log('💵 [Order Creation] Tax: ₹', tax)
    console.log('💵 [Order Creation] Shipping: ₹', shippingCost)
    console.log('💵 [Order Creation] Total: ₹', total)
    
    // 4. Generate order number
    console.log('🔢 [Order Creation] Step 4: Generating order number')
    let orderNumber: string
    
    try {
      // Try to use sequence
      const { data: seqData, error: seqError } = await supabase
        .rpc('nextval', { sequence_name: 'order_number_seq' })
      
      if (seqError) {
        console.log('⚠️  [Order Creation] Sequence not available, using timestamp')
        orderNumber = `ORD-${Date.now()}`
      } else {
        orderNumber = `ORD-${String(seqData).padStart(6, '0')}`
      }
    } catch (err) {
      console.log('⚠️  [Order Creation] Sequence error, using timestamp fallback')
      orderNumber = `ORD-${Date.now()}`
    }
    
    console.log('📄 [Order Creation] Order number:', orderNumber)
    
    // 5. Create Razorpay order if needed (placeholder for now)
    let razorpayOrderId: string | undefined
    
    if (input.paymentMethod === 'razorpay') {
      console.log('💳 [Order Creation] Step 5: Creating Razorpay order')
      // This will be handled by frontend calling /api/payments/create-order
      // We'll store the order first and update with razorpay_order_id later
      console.log('💳 [Order Creation] Razorpay order will be created via API')
    }
    
    // 6. Create order in database
    console.log('💾 [Order Creation] Step 6: Creating order record')
    
    const orderData = {
      order_number: orderNumber,
      clerk_user_id: userId || null,
      guest_email: !userId ? input.shippingAddress.email : null,
      guest_name: !userId ? input.shippingAddress.name : null,
      order_status: 'pending',
      payment_status: input.paymentMethod === 'cod' ? 'pending' : 'pending',
      payment_method: input.paymentMethod,
      razorpay_order_id: razorpayOrderId || null,
      subtotal: subtotal,
      tax: tax,
      shipping_cost: shippingCost,
      discount: 0,
      total_amount: total,
      currency_code: 'INR',
      shipping_address: input.shippingAddress,
      billing_address: input.billingAddress || input.shippingAddress,
      notes: input.notes || null
    }
    
    console.log('📝 [Order Creation] Order data prepared')
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()
    
    if (orderError) {
      console.error('❌ [Order Creation] Failed to create order:', orderError)
      throw orderError
    }
    
    console.log('✅ [Order Creation] Order created with ID:', order.id)
    
    // 7. Create order items
    console.log('📦 [Order Creation] Step 7: Creating order items')
    
    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.title,
      variant_name: null,
      variant_sku: null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) {
      console.error('❌ [Order Creation] Failed to create order items:', itemsError)
      
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id)
      
      throw itemsError
    }
    
    console.log(`✅ [Order Creation] ${orderItems.length} order items created`)
    
    // 8. Decrement inventory
    console.log('📉 [Order Creation] Step 8: Decrementing inventory')
    
    for (const item of cart.items) {
      const productId = item.product_id
      const variantId = item.variant_id
      const quantity = item.quantity
      
      try {
        if (variantId) {
          // Update variant inventory
          console.log(`📉 [Order Creation] Decrementing variant ${variantId} by ${quantity}`)
          await supabase.rpc('decrement_inventory', {
            product_id: variantId,
            quantity: quantity
          })
        } else if (productId) {
          // Update product inventory
          console.log(`📉 [Order Creation] Decrementing product ${productId} by ${quantity}`)
          await supabase.rpc('decrement_inventory', {
            product_id: productId,
            quantity: quantity
          })
        }
      } catch (invError) {
        console.warn('⚠️  [Order Creation] Inventory decrement failed (continuing):', invError)
        // Don't fail the order if inventory decrement fails
        // This can be handled manually by admin
      }
    }
    
    console.log('✅ [Order Creation] Inventory decremented')
    
    // 9. Clear cart
    console.log('🧹 [Order Creation] Step 9: Clearing cart')
    await clearCart(input.cartId)
    console.log('✅ [Order Creation] Cart cleared')
    
    // 10. Fetch complete order with items
    console.log('📥 [Order Creation] Step 10: Fetching complete order')
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', order.id)
      .single()
    
    if (!completeOrder) {
      console.log('⚠️  [Order Creation] Could not fetch complete order')
      return {
        success: true,
        order: order as OrderWithDetails
      }
    }
    
    console.log('✅ [Order Creation] Complete order fetched')
    
    // 11. Send order confirmation email
    console.log('📧 [Order Creation] Step 11: Sending order confirmation email')
    
    const emailAddress = userId 
      ? input.shippingAddress.email 
      : input.shippingAddress.email
    
    if (emailAddress) {
      try {
        const emailResult = await sendOrderConfirmation(emailAddress, {
          orderNumber: completeOrder.order_number,
          items: completeOrder.order_items,
          total: completeOrder.total_amount,
          shippingAddress: completeOrder.shipping_address
        })
        
        if (emailResult.success) {
          console.log('✅ [Order Creation] Order confirmation email sent')
        } else {
          console.log('⚠️  [Order Creation] Email sending failed:', emailResult.error)
        }
      } catch (emailError) {
        console.error('⚠️  [Order Creation] Email error (non-critical):', emailError)
        // Don't fail order creation if email fails
      }
    } else {
      console.log('⚠️  [Order Creation] No email address provided, skipping email')
    }
    
    console.log('🎉 [Order Creation] Order creation completed successfully!')
    console.log('🎉 [Order Creation] Order number:', orderNumber)
    console.log('🎉 [Order Creation] Order ID:', order.id)
    
    return {
      success: true,
      order: completeOrder as OrderWithDetails,
      razorpayOrderId
    }
    
  } catch (error: any) {
    console.error('❌ [Order Creation] Fatal error:', error)
    console.error('❌ [Order Creation] Error stack:', error.stack)
    
    return {
      success: false,
      error: error.message || 'Failed to create order'
    }
  }
}

/**
 * Get order by ID with full details
 */
export async function getOrderById(orderId: string): Promise<{
  success: boolean
  order?: OrderWithDetails
  error?: string
}> {
  console.log('🔍 [Order Fetch] Fetching order:', orderId)
  
  try {
    const supabase = await createServerSupabase()
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single()
    
    if (error) {
      console.error('❌ [Order Fetch] Error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ [Order Fetch] Order found:', order.order_number)
    
    return {
      success: true,
      order: order as OrderWithDetails
    }
  } catch (error: any) {
    console.error('❌ [Order Fetch] Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<{
  success: boolean
  order?: OrderWithDetails
  error?: string
}> {
  console.log('🔍 [Order Fetch] Fetching order by number:', orderNumber)
  
  try {
    const supabase = await createServerSupabase()
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_number', orderNumber)
      .single()
    
    if (error) {
      console.error('❌ [Order Fetch] Error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ [Order Fetch] Order found:', order.id)
    
    return {
      success: true,
      order: order as OrderWithDetails
    }
  } catch (error: any) {
    console.error('❌ [Order Fetch] Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
