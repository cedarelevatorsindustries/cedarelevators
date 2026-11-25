// Quote State Machine - Unified Phase 1 + Legacy Compatibility

export type QuoteStatus =
  | 'draft'
  | 'pending'
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'approved'
  | 'rejected'
  | 'converted'
  | 'expired'

export { type QuoteStatus as QuoteStatusType }

export type UserType = 'guest' | 'individual' | 'business' | 'verified'

const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  draft: ['submitted', 'pending'],
  pending: ['reviewing', 'quoted', 'approved', 'rejected'],
  submitted: ['reviewing', 'quoted', 'rejected'],
  reviewing: ['quoted', 'approved', 'rejected'],
  quoted: ['quoted', 'converted', 'expired'], // quoted -> quoted supports explicit revision reissue
  approved: ['quoted', 'converted', 'expired'],
  rejected: [],
  converted: [],
  expired: [],
}

export function isIssuedQuoteStatus(status?: string | null): boolean {
  return status === 'quoted' || status === 'approved'
}

export function canIssueQuoteStatus(status?: string | null): boolean {
  return ['submitted', 'pending', 'reviewing', 'quoted', 'approved'].includes(status || '')
}

export function isValidTransition(
  currentStatus: QuoteStatus,
  newStatus: QuoteStatus
): boolean {
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || []
  return allowedNext.includes(newStatus)
}

export function getAllowedNextStates(currentStatus: QuoteStatus): QuoteStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] || []
}

export function isTerminalState(status: QuoteStatus): boolean {
  return ['rejected', 'converted', 'expired'].includes(status)
}

export function isQuoteLocked(status: QuoteStatus): boolean {
  return ['rejected', 'converted', 'expired'].includes(status)
}

export function getStatusLabel(status: QuoteStatus): string {
  const labels: Record<QuoteStatus, string> = {
    draft: 'Draft',
    pending: 'Received',
    submitted: 'Submitted',
    reviewing: 'Under Review',
    quoted: 'Quoted',
    approved: 'Quoted',
    rejected: 'Rejected',
    converted: 'Converted',
    expired: 'Expired',
  }
  return labels[status] || status
}

export function getCustomerStatusInfo(status?: string | null): {
  label: string
  tone: 'neutral' | 'info' | 'success' | 'danger' | 'warning'
  description: string
} {
  switch (status) {
    case 'submitted':
    case 'pending':
      return {
        label: 'Received',
        tone: 'info',
        description: 'Your enquiry has been logged and assigned to our technical sales team.',
      }
    case 'reviewing':
      return {
        label: 'Under Review',
        tone: 'warning',
        description: 'Our engineering and commercial desk is preparing your quotation.',
      }
    case 'quoted':
    case 'approved':
      return {
        label: 'Quoted',
        tone: 'success',
        description: 'Your official Cedar Elevators quotation has been issued and is ready to view.',
      }
    case 'rejected':
      return {
        label: 'Unable to Proceed',
        tone: 'danger',
        description: 'Please review our team notes or contact Cedar Elevators for alternatives.',
      }
    case 'expired':
      return {
        label: 'Expired',
        tone: 'neutral',
        description: 'The validity period for this quotation has ended.',
      }
    case 'converted':
      return {
        label: 'Converted',
        tone: 'success',
        description: 'This quotation has been converted.',
      }
    default:
      return {
        label: 'Received',
        tone: 'info',
        description: 'Your quotation request is being processed.',
      }
  }
}

export function getStatusColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    draft: 'gray',
    pending: 'orange',
    submitted: 'orange',
    reviewing: 'blue',
    quoted: 'green',
    approved: 'green',
    rejected: 'red',
    converted: 'emerald',
    expired: 'gray',
  }
  return colors[status] || 'gray'
}

export function validateTransition(
  currentStatus: QuoteStatus,
  newStatus: QuoteStatus
): { valid: boolean; error?: string } {
  if (isTerminalState(currentStatus)) {
    return {
      valid: false,
      error: `Cannot modify quote in ${getStatusLabel(currentStatus)} state`,
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
