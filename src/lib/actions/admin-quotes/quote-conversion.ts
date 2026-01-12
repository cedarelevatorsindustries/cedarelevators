'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { canApproveQuotes } from '@/lib/auth/admin-roles'
import { logQuoteAction } from './quote-audit'

/**
 * Convert quote to order (Verified Business Only)
 */
export async function convertQuoteToOrder(
    quoteId: string,
    orderDetails: {
        shipping_address_id?: string
        delivery_method: string
        payment_method?: string
    }
): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
        // Permission check
        const canConvert = await canApproveQuotes()
        if (!canConvert) {
            return { success: false, error: 'Insufficient permissions to convert quotes' }
        }

        const supabase = createAdminClient()

        // Get quote with all details
        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('*, items:quote_items(*)')
            .eq('id', quoteId)
            .single()

        if (fetchError || !quote) {
            return { success: false, error: 'Quote not found' }
        }

        // Strict validation
        if (quote.status !== 'approved') {
            return { success: false, error: 'Only approved quotes can be converted to orders' }
        }

        if (quote.user_type !== 'verified') {
            return { success: false, error: 'Only verified business accounts can convert quotes to orders' }
        }

        if (!quote.clerk_user_id) {
            return { success: false, error: 'Quote must be associated with a registered user' }
        }

        // Check if quote is still valid
        if (quote.valid_until && new Date(quote.valid_until) < new Date()) {
            return { success: false, error: 'Quote has expired' }
        }

        // Validate items have pricing
        const items = quote.items || []
        if (items.length === 0) {
            return { success: false, error: 'Quote has no items to convert' }
        }

        const missingPricing = items.some((item: any) => !item.unit_price || item.unit_price === 0)
        if (missingPricing) {
            return { success: false, error: 'All items must have pricing before conversion' }
        }

        // Generate order number
        let orderNumber: string
        try {
            const { data: seqData, error: seqError } = await supabase.rpc('nextval', {
                sequence_name: 'order_number_seq'
            })
            if (seqError) {
                orderNumber = `ORD-${Date.now()}`
            } else {
                orderNumber = `ORD-${String(seqData).padStart(6, '0')}`
            }
        } catch (err) {
            orderNumber = `ORD-${Date.now()}`
        }

        // Get user's default shipping address if not provided
        let shippingAddress = null
        if (orderDetails.shipping_address_id) {
            const { data: addressData } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('id', orderDetails.shipping_address_id)
                .single()
            shippingAddress = addressData
        } else {
            // Use company details from quote as fallback
            shippingAddress = {
                name: quote.company_details?.contact_name || quote.guest_name || 'N/A',
                phone: quote.company_details?.contact_phone || quote.guest_phone || 'N/A',
                address_line1: 'Address to be provided',
                city: 'City',
                state: 'State',
                pincode: '000000',
                country: 'India'
            }
        }

        // Create order record
        const orderData = {
            order_number: orderNumber,
            clerk_user_id: quote.clerk_user_id,
            order_status: 'pending',
            payment_status: 'pending',
            payment_method: orderDetails.payment_method || 'bank_transfer',
            subtotal: quote.subtotal,
            tax: quote.tax_total,
            shipping_cost: 0,
            discount: quote.discount_total,
            total_amount: quote.estimated_total,
            currency_code: 'INR',
            shipping_address: shippingAddress,
            billing_address: shippingAddress,
            notes: `Converted from Quote #${quote.quote_number}`,
            quote_id: quote.id
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single()

        if (orderError) {
            console.error('Error creating order:', orderError)
            return { success: false, error: 'Failed to create order: ' + orderError.message }
        }

        // Create order items from quote items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            variant_name: null,
            variant_sku: item.product_sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('Error creating order items:', itemsError)
            // Rollback: delete the order
            await supabase.from('orders').delete().eq('id', order.id)
            return { success: false, error: 'Failed to create order items: ' + itemsError.message }
        }

        // Decrement inventory for each item
        for (const item of items) {
            const productId = item.product_id
            const variantId = item.variant_id
            const quantity = item.quantity

            try {
                if (variantId) {
                    await supabase.rpc('decrement_inventory', {
                        product_id: variantId,
                        quantity: quantity
                    })
                } else if (productId) {
                    await supabase.rpc('decrement_inventory', {
                        product_id: productId,
                        quantity: quantity
                    })
                }
            } catch (invError) {
                console.warn('Inventory decrement warning (non-critical):', invError)
            }
        }

        // Update quote status to converted
        const { error: updateError } = await supabase
            .from('quotes')
            .update({
                status: 'converted',
                converted_order_id: order.id,
                converted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', quoteId)

        if (updateError) {
            console.error('Error updating quote status:', updateError)
        }

        // Log conversion
        await logQuoteAction(quoteId, 'converted', {
            oldStatus: quote.status,
            newStatus: 'converted',
            metadata: {
                quote_number: quote.quote_number,
                order_id: order.id,
                order_number: orderNumber,
                total: quote.estimated_total
            }
        })

        revalidatePath('/admin/quotes')
        revalidatePath(`/admin/quotes/${quoteId}`)
        revalidatePath('/admin/orders')

        return { success: true, orderId: order.id }
    } catch (error: any) {
        console.error('Error in convertQuoteToOrder:', error)
        return { success: false, error: error.message || 'Failed to convert quote' }
    }
}

