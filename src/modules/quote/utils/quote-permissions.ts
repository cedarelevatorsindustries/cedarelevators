export type UserType = 'guest' | 'individual' | 'business';
// Verification status might be 'verified', 'unverified', 'pending', 'rejected'
export type VerificationStatus = string | null;

export interface QuotePermissions {
    canCreate: boolean;
    canViewList: boolean;
    canViewPricing: boolean;
    canCheckout: boolean;
    maxAttachments: number;
    maxItems: number;
    notesMaxLength: number;
    canSaveDraft: boolean;
    canExportCSV: boolean;
    canUseTemplates: boolean;
    hasBulkPricing: boolean;
}

/**
 * Returns the capability set for a given user role.
 */
export function getQuotePermissions(userType: UserType | string | null, verificationStatus: VerificationStatus = null): QuotePermissions {
    // Default: Guest permissions
    const permissions: QuotePermissions = {
        canCreate: true,
        canViewList: false,
        canViewPricing: false,
        canCheckout: false,
        maxAttachments: 0,
        maxItems: 1, // Only single item for guest
        notesMaxLength: 300,
        canSaveDraft: false,
        canExportCSV: false,
        canUseTemplates: false,
        hasBulkPricing: false
    };

    if (!userType || userType === 'guest') {
        return permissions;
    }

    // Role: Individual
    if (userType === 'individual') {
        permissions.canViewList = true;
        permissions.maxAttachments = 1;
        permissions.maxItems = 10;
        permissions.notesMaxLength = 500;
        return permissions;
    }

    // Role: Business
    // (We treat 'verified' user_type as business + verified status if that's how it's stored, 
    // but assuming user_type='business' and verificationStatus is separate)
    if (userType === 'business' || userType === 'verified') {
        const isVerified = verificationStatus === 'verified' || userType === 'verified';

        permissions.canViewList = true;
        permissions.hasBulkPricing = true;
        permissions.maxItems = 50;
        permissions.notesMaxLength = 1000;

        // Unverified Business
        permissions.canViewPricing = true; // They can see prices in response
        permissions.maxAttachments = 2;

        if (isVerified) {
            // Verified Business
            permissions.canCheckout = true;
            permissions.maxAttachments = 5;
            permissions.canSaveDraft = true;
            permissions.canExportCSV = true;
            permissions.canUseTemplates = true;
        }
    }

    return permissions;
}
