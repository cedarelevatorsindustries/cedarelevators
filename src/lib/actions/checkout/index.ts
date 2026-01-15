/**
 * Checkout Actions - Consolidated Export
 * Cedar Elevator Industries
 * 
 * Minimal checkout module with only unique checkout functions.
 * Cart CRUD operations → @/lib/actions/cart
 * Quote management → @/lib/actions/quotes
 * Order retrieval → @/lib/actions/orders
 */

// Types
export type {
    CheckoutEligibility,
    BusinessAddress,
    CheckoutSummary,
    ActionResponse,
    CheckoutMetadata
} from './types'

// Checkout Core Functions
export {
    checkCheckoutEligibility,
    getCheckoutSummary,
    createOrderFromCart,
    getCheckoutFromQuote,
    createOrderFromQuote
} from './core'

// Address Management (checkout-specific)
export {
    getBusinessAddresses,
    getIndividualAddress,
    addBusinessAddress,
    updateBusinessAddress,
    deleteBusinessAddress
} from './addresses'
