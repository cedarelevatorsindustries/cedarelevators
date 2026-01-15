/**
 * Enhanced Order Creation for New Checkout Flow
 * Supports individual limits, shipping methods, and COD
 */

'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'
import type { CheckoutSource, ShippingOption } from '@/modules/checkout/types/checkout-ui'
import { validateIndividualOrder } from './individual-validation'
import { getCheckoutFromQuote } from './core'

interface CreateOrderResult {
    success: boolean
    orderId?: string
    orderNumber?: string
    error?: string
}

export async function createOrder(
    source: CheckoutSource,
    sourceId: string,
    shippingOption: ShippingOption,
    paymentMethod: 'cod',
    notes?: string
): Promise<CreateOrderResult> {
    console.log('🛒 [Order Creation] Starting:', { source, sourceId, shippingMethod: shippingOption.method })

    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Authentication required' }
        }

        const supabase = await createServerSupabase()

        // Get user profile to determine type
        const { data: profile } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('clerk_user_id', userId)
            .single()

        const userType = profile?.verification_status === 'verified'
            ? 'business_verified'
            : profile
                ? 'business_unverified'
                : 'individual'

        console.log('👤 [Order Creation] User type:', userType)

        // PERMISSION CHECKS
        // Cart checkout: Business verified only
        if (source === 'cart' && userType !== 'business_verified') {
            return { success: false, error: 'Cart checkout requires business verification' }
        }

        // Unverified business: Blocked entirely
        if (userType === 'business_unverified') {
            return { success: false, error: 'Business verification required' }
        }

        // Payment method must be COD
        if (paymentMethod !== 'cod') {
            return { success: false, error: 'Only COD payment is supported' }
        }

        // Load order data based on source
        let items, summary
        if (source === 'quote') {
            const quoteData = await getCheckoutFromQuote(sourceId)
            if (!quoteData.success || !quoteData.data) {
                return { success: false, error: 'Failed to load quote data' }
            }
            items = quoteData.data.items
            summary = quoteData.data.summary
        } else {
            // Cart flow - load cart summary
            // TODO: Import cart functions
            return { success: false, error: 'Cart checkout not yet implemented' }
        }

        console.log(`📋 [Order Creation] Loaded ${items.length} items, total: ₹${summary.total}`)

        // ENFORCE INDIVIDUAL LIMITS
        if (userType === 'individual') {
            const validation = await validateIndividualOrder(items, summary.total)
            if (!validation.valid) {
                console.log('❌ [Order Creation] Individual limits exceeded')
                return {
                    success: false,
                    error: `Order exceeds individual limits: ${validation.violations.join(', ')}`
                }
            }
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}`

        // Prepare order data
        const orderData = {
            order_number: orderNumber,
            clerk_user_id: userId,
            business_id: profile?.id || null,
            source,
            source_id: sourceId,

            // Shipping
            shipping_method: shippingOption.method,
            shipping_address: shippingOption.method === 'doorstep' ? shippingOption.address : null,
            pickup_location_id: shippingOption.method === 'pickup' ? shippingOption.pickupLocationId : null,

            // Payment
            payment_method: 'cod',
            payment_status: 'pending',

            // Status
            order_status: 'pending',

            // Amounts
            subtotal: summary.subtotal,
            tax: summary.tax,
            shipping_cost: summary.shipping,
            discount: summary.discount,
            total_amount: summary.total,
            currency_code: 'INR',

            notes
        }

        console.log('💾 [Order Creation] Creating order record')

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single()

        if (orderError) {
            console.error('❌ [Order Creation] Failed:', orderError)
            return { success: false, error: orderError.message }
        }

        console.log('✅ [Order Creation] Order created:', order.id)

        // Create order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
            total_price: item.subtotal || 0
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('❌ [Order Creation] Items failed:', itemsError)
            // Cleanup: delete order
            await supabase.from('orders').delete().eq('id', order.id)
            return { success: false, error: 'Failed to create order items' }
        }

        console.log(`✅ [Order Creation] ${orderItems.length} items created`)

        // TODO: Reserve inventory, send notifications, etc.

        return {
            success: true,
            orderId: order.id,
            orderNumber: order.order_number
        }

    } catch (error: any) {
        console.error('❌ [Order Creation] Fatal error:', error)
        return {
            success: false,
            error: error.message || 'Order creation failed'
        }
    }
}
