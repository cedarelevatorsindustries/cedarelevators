// =====================================================
// Quote Module Feature Flags
// Toggle features without deleting code
// =====================================================

export const QUOTE_FEATURES = {
    // ==================== MESSAGING ====================
    // Hide customer-admin chat for MVP
    ENABLE_QUOTE_MESSAGES: false,
    // Keep internal admin notes
    ENABLE_INTERNAL_NOTES: true,

    // ==================== TEMPLATES ====================
    // Hide quote templates (verified users)
    ENABLE_QUOTE_TEMPLATES: false,

    // ==================== USER COMPLEXITY ====================
    // Use different limits per user type
    ENABLE_USER_TYPE_LIMITS: false,
    // Show different forms per user type
    ENABLE_DIFFERENT_FORMS: false,

    // ==================== BUSINESS HUB ====================
    // Hide quote widgets in business hub
    ENABLE_BUSINESS_HUB_QUOTES: false,

    // ==================== ADMIN FEATURES ====================
    // Hide bulk operations
    ENABLE_BULK_OPERATIONS: false,
    // Hide analytics dashboard
    ENABLE_ANALYTICS: false,
    // Hide priority badges/editor
    ENABLE_PRIORITY_UI: false,
    // Disable real-time updates
    ENABLE_REALTIME_UPDATES: false,

    // ==================== CORE FEATURES (KEEP) ====================
    // Allow quote to order conversion
    ENABLE_QUOTE_TO_ORDER: true,
    // Show audit logs
    ENABLE_AUDIT_LOGS: true,

    // ==================== MVP LIMITS ====================
    // Used when ENABLE_USER_TYPE_LIMITS = false
    MVP_MAX_ITEMS: 20,
    MVP_MAX_ATTACHMENTS: 1,
    MVP_MAX_NOTES_LENGTH: 500,

    // ==================== STATUS LABELS ====================
    // Simplified status labels for MVP
    MVP_STATUS_LABELS: {
        pending: 'Submitted',
        reviewing: 'Under Review',
        approved: 'Responded',
        rejected: 'Declined',
        converted: 'Closed'
    }
} as const

// Type for feature flags
export type QuoteFeatureFlags = typeof QUOTE_FEATURES

// Helper to check if feature is enabled
export function isFeatureEnabled(feature: keyof QuoteFeatureFlags): boolean {
    return QUOTE_FEATURES[feature] === true
}

// Get MVP limits
export function getMVPLimits() {
    return {
        maxItems: QUOTE_FEATURES.MVP_MAX_ITEMS,
        maxAttachments: QUOTE_FEATURES.MVP_MAX_ATTACHMENTS,
        maxNotesLength: QUOTE_FEATURES.MVP_MAX_NOTES_LENGTH
    }
}

// Get status label (MVP or original)
export function getStatusLabel(status: string): string {
    return QUOTE_FEATURES.MVP_STATUS_LABELS[status as keyof typeof QUOTE_FEATURES.MVP_STATUS_LABELS] || status
}

