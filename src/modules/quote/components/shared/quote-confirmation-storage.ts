export interface StoredQuoteConfirmation {
  quoteNumber: string
  itemsCount: number
  requestType: 'general' | 'single' | 'bulk'
  customerEmail?: string | null
  customerName?: string | null
  companyName?: string | null
  submittedAt: string
  emailStatus?: 'sent' | 'failed'
}

const STORAGE_KEY = 'cedar_last_quote_success'

export function saveLastQuoteSuccess(payload: StoredQuoteConfirmation): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage quota / privacy mode restrictions cleanly
  }
}

export function readLastQuoteSuccess(expectedQuoteNumber?: string | null): StoredQuoteConfirmation | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredQuoteConfirmation
    if (!parsed || typeof parsed.quoteNumber !== 'string') return null
    if (expectedQuoteNumber && parsed.quoteNumber !== expectedQuoteNumber) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function maskEmailAddress(email?: string | null): string {
  const clean = (email || '').trim().toLowerCase()
  if (!clean || !clean.includes('@')) return 'your email'
  const [local, domain] = clean.split('@')
  if (!local || !domain) return clean
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

export function formatIndiaDate(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatIndiaDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
