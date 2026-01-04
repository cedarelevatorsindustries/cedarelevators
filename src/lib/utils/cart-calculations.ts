/**
 * Pure Cart Calculation Utilities
 * Cedar Elevator Industries
 * 
 * Shared calculation logic for both client and server.
 * NO SERVER IMPORTS ALLOWED HERE.
 */

import {
    DerivedCartItem,
    CartSummary,
    PricingContext
} from '@/types/cart.types'
import { logger } from '@/lib/services/logger'

// =====================================================
// Constants
// =====================================================

export const GST_RATE = 0.18 // 18% GST (9% CGST + 9% SGST or 18% IGST)
export const DEFAULT_CURRENCY = 'INR'

// =====================================================
// Calculate Cart Subtotal
// =====================================================

export function calculateCartSubtotal(items: DerivedCartItem[]): number {
    return items.reduce((sum, item) => {
        if (item.is_available && item.stock_available) {
            return sum + item.line_total
        }
        return sum
    }, 0)
}

// =====================================================
// Calculate Tax (GST)
// =====================================================

export function calculateTax(
    subtotal: number,
    shipping: number = 0,
    isSameState: boolean = true // For CGST+SGST vs IGST
): {
    cgst: number
    sgst: number
    igst: number
    total: number
} {
    const taxableAmount = subtotal + shipping
    const totalTax = taxableAmount * GST_RATE

    if (isSameState) {
        // Within same state: CGST + SGST
        return {
            cgst: totalTax / 2,
            sgst: totalTax / 2,
            igst: 0,
            total: totalTax
        }
    } else {
        // Different state: IGST
        return {
            cgst: 0,
            sgst: 0,
            igst: totalTax,
            total: totalTax
        }
    }
}

// =====================================================
// Calculate Shipping
// =====================================================

export function calculateShipping(
    itemCount: number,
    deliveryOption?: 'standard' | 'express' | 'custom'
): number {
    // Simple shipping calculation
    // In production, this would be more complex based on weight, location, etc.

    if (!deliveryOption || deliveryOption === 'standard') {
        return 0 // Free standard shipping
    }

    if (deliveryOption === 'express') {
        return 500 // ₹500 for express
    }

    return 0 // Custom delivery - quote based
}

// =====================================================
// Calculate Cart Summary
// =====================================================

export async function calculateCartSummary(
    items: DerivedCartItem[],
    pricingContext: PricingContext,
    deliveryOption?: 'standard' | 'express' | 'custom',
    shippingAddress?: { state: string }
): Promise<CartSummary> {
    try {
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
        const uniqueProducts = new Set(items.map(item => item.product_id)).size

        // Calculate subtotal (only available items)
        const subtotal = calculateCartSubtotal(items)

        // No discount for now (admin handles pricing)
        const discount = 0

        // Calculate shipping
        const shipping = calculateShipping(itemCount, deliveryOption)

        // Calculate tax (assuming same state for now)
        const isSameState = true // TODO: Implement state comparison with business address
        const tax = calculateTax(subtotal, shipping, isSameState).total

        // Calculate total
        const total = subtotal - discount + shipping + tax

        // Check cart state
        const hasUnavailableItems = items.some(item => !item.is_available)
        const hasOutOfStockItems = items.some(item => !item.stock_available)

        // Can checkout only if verified business, no issues, and has items
        const canCheckout =
            pricingContext.userType === 'business_verified' &&
            itemCount > 0 &&
            !hasUnavailableItems &&
            !hasOutOfStockItems

        return {
            itemCount,
            uniqueProducts,
            subtotal,
            discount,
            shipping,
            tax,
            total,
            hasUnavailableItems,
            hasOutOfStockItems,
            canCheckout
        }

    } catch (error) {
        logger.error('calculateCartSummary error', error)
        return {
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
