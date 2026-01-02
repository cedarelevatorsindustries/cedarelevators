// Quote Permissions - Controls what users can see and do based on user type and quote state

import { QuoteStatus, UserType } from './quote-state-machine'

export interface QuotePermissions {
    canViewQuote: boolean
    canViewPricing: boolean
    canEditQuote: boolean
    canConvertToOrder: boolean
    canMessageAdmin: boolean
    canApprove: boolean
    canReject: boolean
    canSetPricing: boolean
}

// Check if user can view pricing
export function canViewPricing(
    userType: UserType,
    quoteStatus: QuoteStatus,
    isVerified: boolean,
    pricingVisible: boolean
): boolean {
    // Guest and individual never see pricing
    if (userType === 'guest' || userType === 'individual') {
        return false
    }

    // Unverified business never sees pricing
    if (userType === 'business' && !isVerified) {
        return false
    }

    // Verified business sees pricing only after admin sets it
    if (userType === 'verified') {
        return pricingVisible && ['approved', 'converted'].includes(quoteStatus)
    }

    return false
}

// Check if user can convert quote to order
export function canConvertToOrder(
    userType: UserType,
    quoteStatus: QuoteStatus,
    isVerified: boolean
): boolean {
    // Only verified business users can convert
    if (userType !== 'verified' || !isVerified) {
        return false
    }

    // Can only convert approved quotes
    return quoteStatus === 'approved'
}

// Check if user can message admin
export function canMessageAdmin(
    userType: UserType,
    isVerified: boolean
): boolean {
    // Only verified business users can message admin
    return userType === 'verified' && isVerified
}

// Get complete permissions for a user
export function getQuotePermissions(
    userType: UserType,
    quoteStatus: QuoteStatus,
    isVerified: boolean,
    pricingVisible: boolean,
    isAdmin: boolean = false
): QuotePermissions {
    // Admin has all permissions
    if (isAdmin) {
        return {
            canViewQuote: true,
            canViewPricing: true,
            canEditQuote: !['converted'].includes(quoteStatus), // Cannot edit converted quotes
            canConvertToOrder: false, // Admin doesn't convert, user does
            canMessageAdmin: false, // Admin doesn't message themselves
            canApprove: quoteStatus === 'reviewing',
            canReject: ['pending', 'reviewing'].includes(quoteStatus),
            canSetPricing: ['reviewing', 'approved'].includes(quoteStatus),
        }
    }

    // Regular user permissions
    return {
        canViewQuote: true, // All logged-in users can view their quotes
        canViewPricing: canViewPricing(userType, quoteStatus, isVerified, pricingVisible),
        canEditQuote: false, // Users cannot edit quotes after submission
        canConvertToOrder: canConvertToOrder(userType, quoteStatus, isVerified),
        canMessageAdmin: canMessageAdmin(userType, isVerified),
        canApprove: false,
        canReject: false,
        canSetPricing: false,
    }
}

// Check if user type is verified business
export function isVerifiedBusiness(userType: UserType, isVerified: boolean): boolean {
    return userType === 'verified' || (userType === 'business' && isVerified)
}

// Get user type label
export function getUserTypeLabel(userType: UserType): string {
    const labels: Record<UserType, string> = {
        guest: 'Guest',
        individual: 'Individual',
        business: 'Business (Unverified)',
        verified: 'Business (Verified)',
    }
    return labels[userType]
}
