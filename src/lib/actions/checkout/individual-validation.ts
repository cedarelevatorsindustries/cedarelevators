/**
 * Individual Checkout Validation
 * Enforces purchase limits for individual users
 */

'use server'

import type { CheckoutItem } from '@/modules/checkout/types/checkout-ui'
import { INDIVIDUAL_LIMITS } from '@/modules/checkout/types/checkout-ui'

interface ValidationResult {
    valid: boolean
    violations: string[]
}

export async function validateIndividualOrder(
    items: CheckoutItem[],
    total: number
): Promise<ValidationResult> {
    const violations: string[] = []

    // Check order value
    if (total > INDIVIDUAL_LIMITS.maxOrderValue) {
        violations.push(
            `Order value ₹${total.toLocaleString('en-IN')} exceeds individual limit of ₹${INDIVIDUAL_LIMITS.maxOrderValue.toLocaleString('en-IN')}`
        )
    }

    // Check quantities per item
    for (const item of items) {
        if (item.quantity > INDIVIDUAL_LIMITS.maxQuantityPerItem) {
            violations.push(
                `${item.title}: Quantity ${item.quantity} exceeds limit of ${INDIVIDUAL_LIMITS.maxQuantityPerItem} per item`
            )
        }
    }

    return {
        valid: violations.length === 0,
        violations
    }
}

export async function getIndividualLimits() {
    return INDIVIDUAL_LIMITS
}
