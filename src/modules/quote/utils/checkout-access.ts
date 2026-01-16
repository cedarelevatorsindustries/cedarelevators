// Utility functions for quote checkout access control

export type UserTier = 'guest' | 'individual' | 'business' | 'verified';

/**
 * Determines if a user can access checkout for an approved quote
 * Rules:
 * - Individual: Can checkout after admin approval
 * - Business (verified): Can checkout after admin approval
 * - Guest: Cannot checkout (blocked)
 * - Business (unverified): Cannot checkout (blocked)
 */
export function canCheckoutQuote(
    userTier: UserTier,
    verificationStatus?: string | null,
    checkoutEnabled?: boolean
): boolean {
    // Checkout must be enabled by admin first
    if (!checkoutEnabled) return false;

    // Guest users cannot checkout
    if (userTier === 'guest') return false;

    // Unverified business users cannot checkout
    if (userTier === 'business' && verificationStatus !== 'verified') {
        return false;
    }

    // Individual and verified business can checkout
    return userTier === 'individual' || (userTier === 'business' && verificationStatus === 'verified') || userTier === 'verified';
}

/**
 * Gets the reason why checkout is blocked (for displaying to user)
 */
export function getCheckoutBlockedReason(
    userTier: UserTier,
    verificationStatus?: string | null,
    checkoutEnabled?: boolean
): string | null {
    if (checkoutEnabled && canCheckoutQuote(userTier, verificationStatus, checkoutEnabled)) {
        return null; // Not blocked
    }

    if (!checkoutEnabled) {
        return 'This quote is pending admin approval. You\'ll receive an email when it\'s ready for checkout.';
    }

    if (userTier === 'guest') {
        return 'Checkout is not available for guest quotes. Please create an account to enable checkout.';
    }

    if (userTier === 'business' && verificationStatus !== 'verified') {
        return 'Complete business verification to unlock checkout capabilities.';
    }

    return 'Checkout is not available for this quote.';
}
