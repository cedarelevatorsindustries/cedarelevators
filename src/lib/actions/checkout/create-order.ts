'use server'

/**
 * Create Order Action - Simplified for Checkout Flow
 * Creates an order directly from cart data without complex RPC
 */

import { createAdminClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

interface CreateOrderInput {
    cartItems: Array<{
        product_id: string
        variant_id?: string
        title: string
        quantity: number
        unit_price: number
        thumbnail?: string
    }>
    summary: {
        subtotal: number
        tax: number
        gst_percentage: number
        shipping: number
        discount: number
        total: number
    }
    shippingMethod: 'doorstep' | 'pickup'
    pickupLocationId?: string
    paymentMethod?: string
}

function generateOrderNumber(): string {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `CED-${year}${month}${day}-${random}`
}

export async function createOrderFromCheckout(input: CreateOrderInput): Promise<{
    success: boolean
    orderId?: string
    orderNumber?: string
    error?: string
}> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Not authenticated' }
        }

        // Use admin client to bypass RLS (auth is already verified by Clerk)
        const supabase = createAdminClient()

        // Get user's cart
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('clerk_user_id', userId)
            .single()

        const orderNumber = generateOrderNumber()

        // Get business profile for business_id
        const { data: businessProfile } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('clerk_user_id', userId)
            .single()

        // Get default address if exists
        const { data: defaultAddress } = await supabase
            .from('business_addresses')
            .select('*')
            .eq('clerk_user_id', userId)
            .eq('is_default', true)
            .single()

        const addressSnapshot = defaultAddress ? {
            address_line1: defaultAddress.address_line_1 || defaultAddress.address_line1 || '',
            address_line2: defaultAddress.address_line_2 || defaultAddress.address_line2 || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            country: defaultAddress.country || 'India',
            postal_code: defaultAddress.postal_code || defaultAddress.pincode || '',
            phone: defaultAddress.phone || ''
        } : {}

        // Get user_id from users table (needed for RLS policy)
        const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', userId)
            .single()

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                clerk_user_id: userId,
                user_id: userRecord?.id,
                business_id: businessProfile?.id,
                cart_id: cart?.id,
                order_status: 'pending',
                payment_status: 'pending',
                payment_method: input.paymentMethod || 'cod',
                subtotal: input.summary.subtotal,
                tax: input.summary.tax,
                gst_amount: input.summary.tax,
                gst_percentage: input.summary.gst_percentage,
                shipping_cost: input.summary.shipping,
                discount: input.summary.discount,
                total_amount: input.summary.total,
                currency_code: 'INR',
                shipping_method: input.shippingMethod,
                pickup_location_id: input.shippingMethod === 'pickup' ? input.pickupLocationId : null,
                shipping_address: addressSnapshot,
                billing_address: addressSnapshot,
                source: 'cart',
                checkout_completed_at: new Date().toISOString()
            })
            .select('id, order_number')
            .single()

        if (orderError) {
            console.error('Failed to create order:', orderError)
            return { success: false, error: orderError.message }
        }

        // Create order items
        const orderItems = input.cartItems.map(item => ({
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
            console.error('Failed to create order items:', itemsError)
            // Order was created, but items failed - still return success
        }

        // Clear cart items after successful order
        if (cart?.id) {
            await supabase.from('cart_items').delete().eq('cart_id', cart.id)
        }

        return {
            success: true,
            orderId: order.id,
            orderNumber: order.order_number
        }
    } catch (error: any) {
        console.error('Order creation error:', error)
        return { success: false, error: error.message || 'Failed to create order' }
    }
}
