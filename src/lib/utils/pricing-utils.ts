import { EnhancedUser } from '@/lib/auth/client'

export type UserPricingState = 'guest' | 'individual' | 'business_unverified' | 'business_verified'

export interface PricingPermissions {
    canViewPrice: boolean
    canBuy: boolean
    canRequestQuote: boolean
    showBulkPricing: boolean
    primaryCTA: string
    secondaryCTA: string
    statusMessage: string
    microCopy: string
}

/**
 * Determine user's pricing state based on authentication and verification
 */
export function getUserPricingState(user: EnhancedUser | null | undefined): UserPricingState {
    if (!user) return 'guest'

    // Use the enhanced user's userType and isVerified properties
    if (user.userType === 'verified') {
        return 'business_verified'
    }

    if (user.userType === 'business') {
        return 'business_unverified'
    }

    return 'individual'
}

/**
 * Check if user can view prices
 */
export function canViewPrice(state: UserPricingState): boolean {
    return state === 'business_unverified' || state === 'business_verified'
}

/**
 * Check if user can buy/add to cart
 */
export function canBuy(state: UserPricingState): boolean {
    return state === 'business_verified'
}

/**
 * Get pricing permissions for a user state
 */
export function getPricingPermissions(state: UserPricingState): PricingPermissions {
    switch (state) {
        case 'guest':
            return {
                canViewPrice: false,
                canBuy: false,
                canRequestQuote: true,
                showBulkPricing: false,
                primaryCTA: 'Login to View Price',
                secondaryCTA: 'Request Quote',
                statusMessage: 'Price available after login',
                microCopy: 'Business pricing is available for registered users only.'
            }

        case 'individual':
            return {
                canViewPrice: false,
                canBuy: false,
                canRequestQuote: true,
                showBulkPricing: false,
                primaryCTA: 'Register as Business',
                secondaryCTA: 'Request Quote',
                statusMessage: 'Business pricing only',
                microCopy: 'Prices and bulk purchasing are available for business accounts.'
            }

        case 'business_unverified':
            return {
                canViewPrice: true,
                canBuy: false,
                canRequestQuote: true,
                showBulkPricing: false,
                primaryCTA: 'Verify Business to Buy',
                secondaryCTA: 'Request Bulk Quote',
                statusMessage: 'Verification required',
                microCopy: 'Verification required to place orders and access checkout'
            }

        case 'business_verified':
            return {
                canViewPrice: true,
                canBuy: true,
                canRequestQuote: true,
                showBulkPricing: true,
                primaryCTA: 'Add to Cart',
                secondaryCTA: 'Add to Quote',
                statusMessage: 'Verified Business',
                microCopy: 'Free delivery for Verified Business'
            }
    }
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null | undefined): string {
    if (!price) return '₹0'
    return `₹${price.toLocaleString('en-IN')}`
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, mrp: number): number {
    if (!mrp || mrp <= price) return 0
    return Math.round(((mrp - price) / mrp) * 100)
}

/**
 * Get primary CTA action URL based on user state
 */
export function getPrimaryCTAUrl(state: UserPricingState): string | null {
    switch (state) {
        case 'guest':
            return '/sign-in'
        case 'individual':
            return '/profile?tab=business'
        case 'business_unverified':
            return '/profile?tab=business'
        default:
            return null // Action handled by onClick
    }
}
