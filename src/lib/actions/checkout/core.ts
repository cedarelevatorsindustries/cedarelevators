/**
 * Unified Checkout Actions
 * Cedar Elevator Industries
 * 
 * Checkout-specific server actions for:
 * - Cart checkout eligibility & order creation
 * - Quote checkout & order creation
 * 
 * Note: Cart CRUD (add/remove items) → /actions/cart.ts
 *       Quote management → /actions/quotes.ts
 */

'use server'

import { createServerSupabase, createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import type { ActionResponse, CheckoutSummary, CheckoutMetadata } from './types'

// =====================================================
// Cart Checkout
// =====================================================

/**
 * Check if cart is eligible for checkout
 */
export async function checkCheckoutEligibility(cartId: string): Promise<ActionResponse<{
    eligible: boolean
    reason?: string
    message?: string
}>> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Not authenticated', data: { eligible: false, reason: 'not_authenticated' } }
        }

        const supabase = await createServerSupabase()
        const { data, error } = await supabase.rpc('validate_checkout_eligibility', {
            p_cart_id: cartId,
            p_clerk_user_id: userId
        })

        if (error) {
            return { success: false, error: error.message, data: { eligible: false, reason: 'validation_error' } }
        }

        return { success: true, data: data as any }
    } catch (error: any) {
        return { success: false, error: error.message, data: { eligible: false, reason: 'unknown_error' } }
    }
}

/**
 * Get checkout data from cart
 */
export async function getCheckoutFromCart(cartId: string): Promise<ActionResponse<{
    items: any[]
    summary: CheckoutSummary
}>> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Not authenticated' }

        const supabase = await createServerSupabase()
        const { data: cartItems } = await supabase
            .from('cart_items')
            .select(`
                *,
                products (
                    id,
                    title,
                    price,
                    thumbnail,
                    slug
                )
            `)
            .eq('cart_id', cartId)

        if (!cartItems || cartItems.length === 0) {
            return {
                success: true,
                data: {
                    items: [],
                    summary: { subtotal: 0, tax: 0, gst_percentage: 18, shipping: 0, discount: 0, total: 0, currency: 'INR' }
                }
            }
        }

        // Map items to standard format
        const items = cartItems.map((item: any) => ({
            id: item.products?.id,
            title: item.products?.title,
            thumbnail: item.products?.thumbnail,
            quantity: item.quantity,
            unit_price: item.products?.price || 0,
            subtotal: (item.products?.price || 0) * item.quantity
        }))

        // Calculate summary
        let subtotal = 0
        items.forEach((item: any) => {
            subtotal += item.subtotal
        })

        const shipping = 0
        const gst_percentage = 18
        const tax = Math.round((subtotal + shipping) * (gst_percentage / 100) * 100) / 100
        const discount = 0
        const total = subtotal + tax + shipping - discount

        return {
            success: true,
            data: {
                items,
                summary: { subtotal, tax, gst_percentage, shipping, discount, total, currency: 'INR' }
            }
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to get cart checkout data' }
    }
}

/**
 * Get checkout summary for cart (Legacy)
 */
export async function getCheckoutSummary(cartId: string): Promise<ActionResponse<CheckoutSummary>> {
    const result = await getCheckoutFromCart(cartId)
    if (!result.success || !result.data) return { success: false, error: result.error }
    return { success: true, data: result.data.summary }
}

/**
 * Create order from cart with enterprise tracking
 */
export async function createOrderFromCart(
    cartId: string,
    shippingAddressId: string,
    billingAddressId?: string,
    metadata?: CheckoutMetadata
): Promise<ActionResponse<{ order_id: string; order_number: string }>> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Not authenticated' }

        const supabase = await createServerSupabase()

        // Get business profile
        const { data: userProfile } = await supabase
            .from('business_profiles')
            .select('id, verification_status')
            .eq('clerk_user_id', userId)
            .single()

        if (!userProfile || userProfile.verification_status !== 'verified') {
            return { success: false, error: 'Business verification required' }
        }

        // Get addresses
        const { data: shippingAddress } = await supabase
            .from('business_addresses')
            .select('*')
            .eq('id', shippingAddressId)
            .eq('clerk_user_id', userId)
            .single()

        if (!shippingAddress) {
            return { success: false, error: 'Shipping address not found' }
        }

        let billingAddress = shippingAddress
        if (billingAddressId && billingAddressId !== shippingAddressId) {
            const { data: billing } = await supabase
                .from('business_addresses')
                .select('*')
                .eq('id', billingAddressId)
                .eq('clerk_user_id', userId)
                .single()

            if (billing) billingAddress = billing
        }

        // Create order with enterprise tracking
        const { data: orderId, error: orderError } = await supabase.rpc('create_order_from_cart', {
            p_cart_id: cartId,
            p_clerk_user_id: userId,
            p_business_id: userProfile.id,
            p_shipping_address: shippingAddress,
            p_billing_address: billingAddress,
            p_checkout_session_id: metadata?.sessionId || null,
            p_ip_address: metadata?.ipAddress || null,
            p_user_agent: metadata?.userAgent || null
        })

        if (orderError) {
            return { success: false, error: orderError.message }
        }

        // Get order details
        const { data: order } = await supabase
            .from('orders')
            .select('id, order_number')
            .eq('id', orderId)
            .single()

        if (!order) {
            return { success: false, error: 'Failed to fetch order details' }
        }

        return {
            success: true,
            data: { order_id: order.id, order_number: order.order_number },
            message: 'Order created successfully'
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to create order' }
    }
}

// =====================================================
// Quote Checkout
// =====================================================

/**
 * Get checkout data from approved quote
 */
export async function getCheckoutFromQuote(quoteId: string): Promise<ActionResponse<{
    quote: any
    items: any[]
    summary: CheckoutSummary
    canCheckout: boolean
    blockReason?: string
}>> {
    try {
        const { userId } = await auth()
        console.log('[getCheckoutFromQuote] Starting - quoteId:', quoteId, 'userId:', userId)

        if (!userId) {
            console.error('[getCheckoutFromQuote] No userId found')
            return { success: false, error: 'Not authenticated' }
        }

        const supabase = await createClerkSupabaseClient()

        // Get quote with items
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select(`
        *,
        quote_items (
          id,
          product_id,
          variant_id,
          product_name,
          product_sku,
          product_thumbnail,
          quantity,
          unit_price,
          total_price
        )
      `)
            .eq('id', quoteId)
            .eq('user_id', userId)
            .single()

        console.log('[getCheckoutFromQuote] Query result:', {
            hasQuote: !!quote,
            quoteError: quoteError?.message,
            quoteStatus: quote?.status,
            itemCount: quote?.quote_items?.length
        })

        if (quoteError || !quote) {
            console.error('[getCheckoutFromQuote] Quote not found:', quoteError)
            return { success: false, error: 'Quote not found or access denied' }
        }

        // Check if quote is approved
        if (quote.status !== 'approved') {
            console.warn('[getCheckoutFromQuote] Quote not approved, status:', quote.status)
            return {
                success: true,
                data: {
                    quote,
                    items: [],
                    summary: { subtotal: 0, tax: 0, gst_percentage: 18, shipping: 0, discount: 0, total: 0, currency: 'INR' },
                    canCheckout: false,
                    blockReason: 'quote_not_approved'
                }
            }
        }

        // Map quote items to checkout format
        const items = (quote.quote_items || []).map((item: any) => ({
            id: item.product_id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            title: item.product_name,
            thumbnail: item.product_thumbnail || null,
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
            subtotal: item.total_price || (item.unit_price * item.quantity),
            sku: item.product_sku
        }))

        console.log('[getCheckoutFromQuote] Mapped items:', items.length, 'items')

        // Calculate summary
        let subtotal = 0
        items.forEach((item: any) => { subtotal += item.subtotal || 0 })

        const shipping = 0
        const gst_percentage = 18
        const tax = Math.round((subtotal + shipping) * (gst_percentage / 100) * 100) / 100
        const discount = 0
        const total = subtotal + tax + shipping - discount

        console.log('[getCheckoutFromQuote] Success - total:', total)

        return {
            success: true,
            data: {
                quote,
                items,
                summary: { subtotal, tax, gst_percentage, shipping, discount, total, currency: 'INR' },
                canCheckout: true
            }
        }
    } catch (error: any) {
        console.error('[getCheckoutFromQuote] Exception:', error)
        return { success: false, error: error.message || 'Failed to get quote checkout data' }
    }
}

/**
 * Create order from approved quote with enterprise tracking
 */
export async function createOrderFromQuote(
    quoteId: string,
    shippingAddressId: string,
    billingAddressId?: string,
    metadata?: CheckoutMetadata
): Promise<ActionResponse<{ order_id: string; order_number: string }>> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Not authenticated' }

        const supabase = await createServerSupabase()

        // Validate quote
        const { data: quote } = await supabase
            .from('quotes')
            .select('id, status, business_id')
            .eq('id', quoteId)
            .eq('clerk_user_id', userId)
            .single()

        if (!quote || quote.status !== 'approved') {
            return { success: false, error: 'Quote not approved' }
        }

        // Create order via RPC
        const { data: orderId, error } = await supabase.rpc('create_order_from_quote', {
            p_quote_id: quoteId,
            p_clerk_user_id: userId,
            p_business_id: quote.business_id,
            p_shipping_address_id: shippingAddressId,
            p_billing_address_id: billingAddressId || shippingAddressId,
            p_checkout_session_id: metadata?.sessionId || null,
            p_ip_address: metadata?.ipAddress || null,
            p_user_agent: metadata?.userAgent || null
        })

        if (error) return { success: false, error: error.message }

        // Get order details
        const { data: order } = await supabase
            .from('orders')
            .select('id, order_number')
            .eq('id', orderId)
            .single()

        // Update quote status
        await supabase
            .from('quotes')
            .update({ status: 'converted' })
            .eq('id', quoteId)

        return {
            success: true,
            data: { order_id: order!.id, order_number: order!.order_number },
            message: 'Order created from quote'
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to create order from quote' }
    }
}
