// Quote State Machine - Enforces valid state transitions
// Based on specification: draft → pending → reviewing → approved/rejected → converted

export type QuoteStatus =
    | 'draft'
    | 'pending'
    | 'reviewing'
    | 'approved'
    | 'rejected'
    | 'converted'
    | 'expired'

// Named export for backward compatibility
export { type QuoteStatus as QuoteStatusType }

export type UserType = 'guest' | 'individual' | 'business' | 'verified'

// Valid state transitions map
const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
    draft: ['pending'],
    pending: ['reviewing', 'rejected'], // Can reject without review
    reviewing: ['approved', 'rejected'],
    approved: ['converted', 'expired'],
    rejected: [], // Terminal state
    converted: [], // Terminal state
    expired: [], // Terminal state
}

// Check if a state transition is allowed
export function isValidTransition(
    currentStatus: QuoteStatus,
    newStatus: QuoteStatus
): boolean {
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus]
    return allowedNext.includes(newStatus)
}

// Get all allowed next states for a given status
export function getAllowedNextStates(currentStatus: QuoteStatus): QuoteStatus[] {
    return ALLOWED_TRANSITIONS[currentStatus] || []
}

// Check if a quote is in a terminal state (cannot be modified)
export function isTerminalState(status: QuoteStatus): boolean {
    return ['rejected', 'converted', 'expired'].includes(status)
}

// Check if a quote is locked (cannot be edited)
export function isQuoteLocked(status: QuoteStatus): boolean {
    // Quotes are locked after approval or in terminal states
    return ['approved', 'rejected', 'converted', 'expired'].includes(status)
}

// Get human-readable status label
export function getStatusLabel(status: QuoteStatus): string {
    const labels: Record<QuoteStatus, string> = {
        draft: 'Draft',
        pending: 'Pending Review',
        reviewing: 'Under Review',
        approved: 'Approved',
        rejected: 'Rejected',
        converted: 'Converted to Order',
        expired: 'Expired',
    }
    return labels[status]
}

// Get status color for UI
export function getStatusColor(status: QuoteStatus): string {
    const colors: Record<QuoteStatus, string> = {
        draft: 'gray',
        pending: 'orange',
        reviewing: 'blue',
        approved: 'green',
        rejected: 'red',
        converted: 'emerald',
        expired: 'gray',
    }
    return colors[status]
}

// Validate state transition with error message
export function validateTransition(
    currentStatus: QuoteStatus,
    newStatus: QuoteStatus
): { valid: boolean; error?: string } {
    if (currentStatus === newStatus) {
        return { valid: false, error: 'Quote is already in this state' }
    }

    if (isTerminalState(currentStatus)) {
        return {
            valid: false,
            error: `Cannot modify quote in ${getStatusLabel(currentStatus)} state`
        }
    }

    if (!isValidTransition(currentStatus, newStatus)) {
        return {
            valid: false,
            error: `Invalid transition from ${getStatusLabel(currentStatus)} to ${getStatusLabel(newStatus)}`,
        }
    }

    return { valid: true }
}
