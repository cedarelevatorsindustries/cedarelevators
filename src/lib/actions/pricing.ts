'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import {
    CartItem,
    DerivedCartItem,
    CartSummary,
    PricingContext,
    canSeePrice
} from '@/types/cart.types'
import { logger } from '@/lib/services/logger'
import { calculateCartSummary } from '@/lib/utils/cart-calculations'

// =====================================================
// Derive Single Item Price
// =====================================================

export async function deriveItemPrice(
    productId: string,
    variantId?: string | null,
    pricingContext?: PricingContext
): Promise<{
    unit_price: number
    compare_at_price?: number
    discount_percentage?: number
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        // If variant exists, get variant price
        if (variantId) {
            const { data: variant } = await supabase
                .from('product_variants')
                .select('price, compare_at_price')
                .eq('id', variantId)
                .eq('status', 'active')
                .single()

            if (variant) {
                const discount = variant.compare_at_price && variant.price
                    ? ((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100
                    : 0

                return {
                    unit_price: variant.price || 0,
                    compare_at_price: variant.compare_at_price || undefined,
                    discount_percentage: discount > 0 ? Math.round(discount) : undefined
                }
            }
        }

        // Get product price
        const { data: product } = await supabase
            .from('products')
            .select('price, compare_at_price')
            .eq('id', productId)
            .eq('status', 'active')
            .single()

        if (!product) {
            return { unit_price: 0 }
        }

        const discount = product.compare_at_price && product.price
            ? ((product.compare_at_price - product.price) / product.compare_at_price) * 100
            : 0

        return {
            unit_price: product.price || 0,
            compare_at_price: product.compare_at_price || undefined,
            discount_percentage: discount > 0 ? Math.round(discount) : undefined
        }

    } catch (error) {
        logger.error('deriveItemPrice error', error)
        return { unit_price: 0 }
    }
}

// =====================================================
// Derive Cart Items (with prices and availability)
// =====================================================

export async function deriveCartItems(
    items: CartItem[],
    pricingContext: PricingContext
): Promise<DerivedCartItem[]> {
    try {
        const supabase = await createClerkSupabaseClient()
        const showPrices = canSeePrice(pricingContext.userType)

        const derivedItems: DerivedCartItem[] = []

        for (const item of items) {
            // Get product details
            const { data: product } = await supabase
                .from('products')
                .select('id, name, slug, sku, status, price, compare_at_price, stock_quantity')
                .eq('id', item.product_id)
                .single()

            if (!product) {
                // Product deleted or not found
                derivedItems.push({
                    ...item,
                    unit_price: 0,
                    line_total: 0,
                    stock_available: false,
                    is_available: false,
                    product: {
                        name: item.title,
                        slug: '',
                        status: 'archived'
                    }
                })
                continue
            }

            // Get variant details if exists
            let variant = null
            if (item.variant_id) {
                const { data } = await supabase
                    .from('product_variants')
                    .select('name, sku, status, price, compare_at_price, inventory_quantity')
                    .eq('id', item.variant_id)
                    .single()
                variant = data
            }

            // Determine price source (variant or product)
            const priceSource = variant || product
            const stockQty = variant?.inventory_quantity ?? product.stock_quantity ?? 0

            // Calculate pricing
            let unit_price = 0
            let compare_at_price = undefined
            let discount_percentage = undefined

            if (showPrices) {
                unit_price = priceSource.price || 0
                compare_at_price = priceSource.compare_at_price || undefined

                if (compare_at_price && unit_price) {
                    discount_percentage = Math.round(((compare_at_price - unit_price) / compare_at_price) * 100)
                }
            }

            const line_total = unit_price * item.quantity
            const stock_available = stockQty >= item.quantity
            const is_available = product.status === 'active' && (!variant || variant.status === 'active')

            derivedItems.push({
                ...item,
                unit_price,
                compare_at_price,
                discount_percentage,
                line_total,
                stock_available,
                is_available,
                product: {
                    name: product.name,
                    slug: product.slug,
                    sku: product.sku || undefined,
                    status: product.status
                },
                variant: variant ? {
                    name: variant.name,
                    sku: variant.sku,
                    status: variant.status
                } : undefined
            })
        }

        return derivedItems

    } catch (error) {
        logger.error('deriveCartItems error', error)
        return []
    }
}

// =====================================================
// Get Full Cart with Derived Pricing
// =====================================================

export async function getCartWithPricing(
    cartId: string,
    pricingContext: PricingContext
): Promise<{
    items: DerivedCartItem[]
    summary: CartSummary
}> {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get cart items
        const { data: cartItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cartId)
            .order('created_at', { ascending: false })

        if (!cartItems || cartItems.length === 0) {
            return {
                items: [],
                summary: {
                    itemCount: 0,
                    uniqueProducts: 0,
                    subtotal: 0,
                    discount: 0,
                    shipping: 0,
                    tax: 0,
                    total: 0,
                    hasUnavailableItems: false,
                    hasOutOfStockItems: false,
                    canCheckout: false
                }
            }
        }

        // Derive items with pricing
        const derivedItems = await deriveCartItems(cartItems as CartItem[], pricingContext)

        // Calculate summary
        const summary = await calculateCartSummary(derivedItems, pricingContext)

        return { items: derivedItems, summary }

    } catch (error) {
        logger.error('getCartWithPricing error', error)
        return {
            items: [],
            summary: {
                itemCount: 0,
                uniqueProducts: 0,
                subtotal: 0,
                discount: 0,
                shipping: 0,
                tax: 0,
                total: 0,
                hasUnavailableItems: false,
                hasOutOfStockItems: false,
                canCheckout: false
            }
        }
    }
}
