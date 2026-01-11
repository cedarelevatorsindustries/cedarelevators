/**
 * Admin Quotes Module
 * 
 * This module provides all admin quote management functionality,
 * organized into logical sub-modules for better maintainability.
 */

// Audit logging and expiry
export {
    getQuoteAuditTimeline,
    checkAndExpireQuote,
    expireOverdueQuotes
} from './quote-audit'

// Query operations
export {
    getAdminQuotes,
    getAdminQuoteById,
    getAdminQuoteStats,
    getQuoteAuditLog,
    type AdminQuoteFilters
} from './quote-queries'

// Status management
export {
    updateQuoteStatus,
    approveQuote,
    rejectQuote,
    updateQuotePriority
} from './quote-status'

// Pricing operations
export {
    updateQuotePricing,
    updateQuoteItemPricing
} from './quote-pricing'

// Quote to order conversion
export { convertQuoteToOrder } from './quote-conversion'

// Messaging
export { addAdminQuoteMessage } from './quote-messages'

// Management operations
export { deleteQuote } from './quote-management'

