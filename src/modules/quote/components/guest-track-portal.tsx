'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Mail,
  ShieldCheck,
  Loader2,
  FileText,
  Download,
  LogOut,
  ArrowRight,
  Building2,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatINR } from '@/lib/utils/quote-pricing'
import { QuotationPageShell, QuotationPageHeader } from './shared/quotation-page-shell'
import { QuotationStatusBadge } from './shared/quotation-status-badge'
import { formatIndiaDate } from './shared/quote-confirmation-storage'

interface HistoryQuoteItem {
  id: string
  quote_number: string
  submitted_at: string
  company_name: string | null
  items_count: number
  summary: string
  request_type: string
  status: string
  customer_status: { label: string; tone: string }
  is_issued: boolean
  quoted_total: number | null
  currency: string
  valid_until: string | null
  can_download_pdf: boolean
}

interface GuestTrackPortalProps {
  initialVerifiedEmail: string | null
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Received' },
  { value: 'reviewing', label: 'Under Review' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'rejected', label: 'Unable to Proceed' },
  { value: 'expired', label: 'Expired' },
]

function formatRequestTypeLabel(type: string, itemsCount: number): string {
  if (type === 'bulk' || itemsCount >= 2) return 'Multi-Product'
  if (type === 'single' || itemsCount === 1) return 'Single Product'
  return 'General Enquiry'
}

export function GuestTrackPortal({ initialVerifiedEmail }: GuestTrackPortalProps) {
  const router = useRouter()
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(initialVerifiedEmail)
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false)

  // Step 1: Email entry state
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSendingCode, setIsSendingCode] = useState(false)

  // Step 2: Verified history state
  const [quotes, setQuotes] = useState<HistoryQuoteItem[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingHistory, setIsLoadingHistory] = useState(Boolean(initialVerifiedEmail))
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    setHistoryError(null)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        sort: sortOrder,
        page: String(page),
      })
      const res = await fetch(`/api/quotes/track/history?${params.toString()}`)
      if (res.status === 401) {
        setVerifiedEmail(null)
        setSessionExpiredNotice(true)
        return
      }
      const data = await res.json()
      if (data.success) {
        setQuotes(data.quotes || [])
        setTotal(typeof data.total === 'number' ? data.total : (data.quotes || []).length)
        setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1)
      } else {
        setHistoryError(data.error || 'Unable to load your quotation history.')
      }
    } catch {
      setHistoryError('Network error while loading quotation history. Please retry.')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [statusFilter, sortOrder, page])

  useEffect(() => {
    if (verifiedEmail) {
      loadHistory()
    }
  }, [verifiedEmail, loadHistory])

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = emailInput.trim().toLowerCase()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setEmailError(null)
    setIsSendingCode(true)

    try {
      const res = await fetch('/api/quotes/track/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        const msg = data.error || 'Unable to send verification code right now.'
        setEmailError(msg)
        toast.error(msg)
        return
      }

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            'cedar_otp_cooldown_until',
            String(Date.now() + 60 * 1000)
          )
        } catch {
          // Ignore storage limitations
        }
      }

      toast.success('Verification code sent to your email.')
      router.push(`/quotes/track/verify?email=${encodeURIComponent(cleanEmail)}`)
    } catch {
      const msg = 'Network error while sending verification code.'
      setEmailError(msg)
      toast.error(msg)
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/quotes/track/logout', { method: 'POST' })
      setVerifiedEmail(null)
      setSessionExpiredNotice(false)
      setQuotes([])
      setPage(1)
      toast.success('Signed out of quotation tracking')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Initial / Unverified Screen
  if (!verifiedEmail) {
    return (
      <QuotationPageShell maxWidth="narrow">
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_2px_rgba(17,24,39,0.04)] p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/70 flex items-center justify-center mx-auto text-orange-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="type-eyebrow text-orange-600 pt-1">Customer Access</p>
            <h1 className="type-subsection text-gray-900">Track Your Quotations</h1>
            <p className="type-body-sm text-gray-600">
              We&apos;ll send a verification code to your email. No password or account registration required.
            </p>
          </div>

          {sessionExpiredNotice && (
            <div
              role="alert"
              className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-amber-900"
            >
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>Your verification session expired. Verify your email again to continue.</span>
            </div>
          )}

          <form onSubmit={handleRequestCode} noValidate className="space-y-4">
            <div>
              <label htmlFor="track-email" className="block text-sm text-gray-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="track-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'track-email-error' : undefined}
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value)
                    if (emailError) setEmailError(null)
                  }}
                  placeholder="name@company.com"
                  className={`w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors ${
                    emailError ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
              </div>
              {emailError && (
                <p id="track-email-error" role="alert" className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSendingCode}
              className="w-full min-h-[44px] py-2.5 px-5 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSendingCode ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Need a new quotation?{' '}
            <Link href="/quotes/new" className="text-orange-600 hover:underline">
              Request a Quotation
            </Link>
          </div>
        </div>
      </QuotationPageShell>
    )
  }

  // Authenticated History View
  return (
    <QuotationPageShell maxWidth="wide">
      <QuotationPageHeader
        eyebrow="Verified Session"
        title="Your Quotations"
        description={`Showing quotation requests submitted with ${verifiedEmail}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors shadow-sm"
            >
              <span>Request a Quotation</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        }
      />

      {/* Filter + Sort Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-3.5 sm:p-4 mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {STATUS_FILTERS.map((opt) => {
            const active = statusFilter === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setStatusFilter(opt.value)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
          <span className="text-xs text-gray-500 tabular-nums">
            {total} {total === 1 ? 'quotation' : 'quotations'}
          </span>

          <div className="inline-flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <label htmlFor="track-sort" className="sr-only">
              Sort quotations
            </label>
            <select
              id="track-sort"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value === 'oldest' ? 'oldest' : 'newest')
                setPage(1)
              }}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700 outline-none focus:border-orange-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main List Content */}
      {isLoadingHistory ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
          <span className="text-sm">Loading your quotations...</span>
        </div>
      ) : historyError ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-gray-800">{historyError}</p>
          <button
            type="button"
            onClick={loadHistory}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-10 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="type-subsection text-gray-900">No Quotations Found</h2>
          <p className="type-body-sm text-gray-500 max-w-md mx-auto">
            {statusFilter !== 'all'
              ? 'No quotations match the selected status filter.'
              : 'Your quotation requests will appear here once you submit an enquiry using this email address.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {statusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all')
                  setPage(1)
                }}
                className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-sm transition-colors"
              >
                Show All Quotations
              </button>
            )}
            <Link
              href="/quotes/new"
              className="px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors"
            >
              Request a Quotation
            </Link>
            <Link
              href="/products"
              className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-sm transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200/90 shadow-[0_1px_2px_rgba(17,24,39,0.03)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3.5 font-normal">Quotation</th>
                  <th className="text-left px-4 py-3.5 font-normal">Submitted</th>
                  <th className="text-left px-4 py-3.5 font-normal">Type &amp; Items</th>
                  <th className="text-left px-4 py-3.5 font-normal">Status</th>
                  <th className="text-left px-4 py-3.5 font-normal">Quoted Total</th>
                  <th className="text-right px-5 py-3.5 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={`/quotes/track/${q.id}`}
                        className="font-mono text-gray-900 hover:text-orange-600 transition-colors"
                      >
                        #{q.quote_number}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{q.summary}</p>
                    </td>
                    <td className="px-4 py-4 align-top whitespace-nowrap text-gray-700">
                      {formatIndiaDate(q.submitted_at)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-gray-800">
                        {formatRequestTypeLabel(q.request_type, q.items_count)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {q.items_count === 0
                          ? 'General enquiry'
                          : `${q.items_count} ${q.items_count === 1 ? 'item' : 'items'}`}
                        {q.company_name ? ` · ${q.company_name}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <QuotationStatusBadge
                        status={q.status}
                        labelOverride={q.customer_status?.label}
                        toneOverride={q.customer_status?.tone}
                      />
                    </td>
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      {q.is_issued && q.quoted_total !== null ? (
                        <div>
                          <p className="text-gray-900 tabular-nums">{formatINR(q.quoted_total)}</p>
                          {q.valid_until && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Valid until {formatIndiaDate(q.valid_until)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Pending quotation</span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Link
                          href={`/quotes/track/${q.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs text-gray-800 transition-colors"
                        >
                          <span>View Quotation</span>
                        </Link>
                        {q.can_download_pdf && (
                          <a
                            href={`/api/quotes/track/${q.id}/pdf`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-xs text-white transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="md:hidden space-y-3">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-gray-200/90 p-4 space-y-3 shadow-[0_1px_2px_rgba(17,24,39,0.03)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/quotes/track/${q.id}`}
                      className="font-mono text-sm text-gray-900 hover:text-orange-600"
                    >
                      #{q.quote_number}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatRequestTypeLabel(q.request_type, q.items_count)} ·{' '}
                      {q.items_count === 0
                        ? 'General enquiry'
                        : `${q.items_count} ${q.items_count === 1 ? 'item' : 'items'}`}
                    </p>
                  </div>
                  <QuotationStatusBadge
                    status={q.status}
                    labelOverride={q.customer_status?.label}
                    toneOverride={q.customer_status?.tone}
                  />
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{q.summary}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatIndiaDate(q.submitted_at)}</span>
                  </span>
                  {q.company_name && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{q.company_name}</span>
                    </span>
                  )}
                </div>

                {q.is_issued && q.quoted_total !== null && (
                  <div className="rounded-lg bg-orange-50/70 border border-orange-200/70 px-3 py-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-600">
                      Quoted Amount
                      {q.valid_until ? ` · Valid until ${formatIndiaDate(q.valid_until)}` : ''}
                    </span>
                    <span className="text-sm text-orange-700 tabular-nums">
                      {formatINR(q.quoted_total)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/quotes/track/${q.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs text-gray-800 transition-colors"
                  >
                    <span>View Quotation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {q.can_download_pdf && (
                    <a
                      href={`/api/quotes/track/${q.id}/pdf`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-xs text-white transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-200/90 px-4 py-3">
              <p className="text-xs sm:text-sm text-gray-600 tabular-nums">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm text-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm text-gray-700 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </QuotationPageShell>
  )
}
