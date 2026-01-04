import { QUOTE_FEATURES, QuoteFeatureFlags } from '@/lib/config/quote-features'

/**
 * Hook to access quote feature flags
 * Use this instead of importing QUOTE_FEATURES directly
 */
export function useQuoteFeatures() {
    return {
        // Feature checks
        isMessagingEnabled: QUOTE_FEATURES.ENABLE_QUOTE_MESSAGES,
        isTemplatesEnabled: QUOTE_FEATURES.ENABLE_QUOTE_TEMPLATES,
        isBusinessHubEnabled: QUOTE_FEATURES.ENABLE_BUSINESS_HUB_QUOTES,
        isBulkOpsEnabled: QUOTE_FEATURES.ENABLE_BULK_OPERATIONS,
        isAnalyticsEnabled: QUOTE_FEATURES.ENABLE_ANALYTICS,
        isPriorityUIEnabled: QUOTE_FEATURES.ENABLE_PRIORITY_UI,
        isRealtimeEnabled: QUOTE_FEATURES.ENABLE_REALTIME_UPDATES,
        isQuoteToOrderEnabled: QUOTE_FEATURES.ENABLE_QUOTE_TO_ORDER,
        isAuditLogsEnabled: QUOTE_FEATURES.ENABLE_AUDIT_LOGS,
        isInternalNotesEnabled: QUOTE_FEATURES.ENABLE_INTERNAL_NOTES,

        // Limit checks
        useUserTypeLimits: QUOTE_FEATURES.ENABLE_USER_TYPE_LIMITS,
        useDifferentForms: QUOTE_FEATURES.ENABLE_DIFFERENT_FORMS,

        // Get limits
        getMVPLimits: () => ({
            maxItems: QUOTE_FEATURES.MVP_MAX_ITEMS,
            maxAttachments: QUOTE_FEATURES.MVP_MAX_ATTACHMENTS,
            maxNotesLength: QUOTE_FEATURES.MVP_MAX_NOTES_LENGTH
        }),

        // Get status label
        getStatusLabel: (status: string) => {
            return QUOTE_FEATURES.MVP_STATUS_LABELS[status as keyof typeof QUOTE_FEATURES.MVP_STATUS_LABELS] || status
        },

        // Raw access if needed
        features: QUOTE_FEATURES
    }
}

/**
 * Server-side feature check
 */
export function checkQuoteFeature(feature: keyof QuoteFeatureFlags): boolean {
    return QUOTE_FEATURES[feature] === true
}

