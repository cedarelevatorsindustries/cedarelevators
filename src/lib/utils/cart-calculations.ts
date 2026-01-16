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
// Types
// =====================================================

export interface TaxSettings {
    gst_enabled: boolean
    default_gst_percentage: number | string  // Database may return string
    use_cgst_sgst_igst: boolean
}

// =====================================================
// Constants
// =====================================================

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
    taxSettings: TaxSettings | null,
    isSameState: boolean = true // For CGST+SGST vs IGST
): {
    cgst: number
    sgst: number
    igst: number
    total: number
} {
    // If tax is disabled or no settings, return zero tax
    if (!taxSettings || !taxSettings.gst_enabled) {
        console.log('[Tax Debug] Tax disabled or no settings:', {
            hasTaxSettings: !!taxSettings,
            gst_enabled: taxSettings?.gst_enabled
        })
        return {
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0
        }
    }

    const taxableAmount = subtotal + shipping
    // Convert to number in case database returns string
    const gstPercentage = typeof taxSettings.default_gst_percentage === 'string'
        ? parseFloat(taxSettings.default_gst_percentage)
        : taxSettings.default_gst_percentage
    const gstRate = gstPercentage / 100
    const totalTax = taxableAmount * gstRate

    console.log('[Tax Debug] Calculating tax:', {
        taxableAmount,
        gstPercentage,
        gstRate,
        totalTax,
        taxSettings
    })

    // Check if CGST/SGST split is enabled
    if (taxSettings.use_cgst_sgst_igst && isSameState) {
        // Within same state: CGST + SGST
        return {
            cgst: totalTax / 2,
            sgst: totalTax / 2,
            igst: 0,
            total: totalTax
        }
    } else if (taxSettings.use_cgst_sgst_igst && !isSameState) {
        // Different state: IGST
        return {
            cgst: 0,
            sgst: 0,
            igst: totalTax,
            total: totalTax
        }
    } else {
        // Split disabled, just return total as GST
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
    taxSettings: TaxSettings | null,
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
        const tax = calculateTax(subtotal, shipping, taxSettings, isSameState).total

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

