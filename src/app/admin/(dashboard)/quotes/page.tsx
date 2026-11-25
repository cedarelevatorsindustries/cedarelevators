'use client'

import { useState, useEffect, useCallback } from 'react'
import { Quote, QuoteStatus } from '@/types/b2b/quote'
import { getAdminQuotes, type QuoteListMetrics } from '@/lib/actions/admin-quotes'
import {
  FileText,
  Search,
  LoaderCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  X,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getStatusConfig, getRequestTypeBadge } from '@/domains/admin/components'
import { formatINR } from '@/lib/utils/quote-pricing'

const EMPTY_METRICS: QuoteListMetrics = {
  total: 0,
  submitted: 0,
  reviewing: 0,
  quoted: 0,
  rejectedOrExpired: 0,
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [total, setTotal] = useState(0)
  const [metrics, setMetrics] = useState<QuoteListMetrics>(EMPTY_METRICS)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [requestTypeFilter, setRequestTypeFilter] = useState<'all' | 'general' | 'single' | 'bulk'>('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_total'>('newest')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(searchInput.trim())
    }, 280)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadQuotes = useCallback(async () => {
    setLoadError(null)
    try {
      const result = await getAdminQuotes({
        status: statusFilter,
        request_type: requestTypeFilter,
        date_range: dateRange,
        search: debouncedSearch,
        sort: sortBy,
        page,
        pageSize,
      })

      if (result.success) {
        setQuotes(result.quotes || [])
        setTotal(result.total || 0)
        setMetrics(result.metrics || EMPTY_METRICS)
      } else {
        setQuotes([])
        setLoadError(result.error || 'Failed to load quotation requests')
      }
    } catch {
      setQuotes([])
      setLoadError('Unable to reach server while fetching quotation requests.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [statusFilter, requestTypeFilter, dateRange, debouncedSearch, sortBy, page])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadQuotes()
  }

  const handleCopyQuoteNumber = (quoteId: string, quoteNumber: string) => {
    navigator.clipboard?.writeText(quoteNumber)
    setCopiedId(quoteId)
    toast.success(`Copied ${quoteNumber}`)
    setTimeout(() => setCopiedId((prev) => (prev === quoteId ? null : prev)), 1800)
  }

  const clearAllFilters = () => {
    setStatusFilter('all')
    setRequestTypeFilter('all')
    setDateRange('all')
    setSortBy('newest')
    setSearchInput('')
    setDebouncedSearch('')
    setPage(1)
  }

  const hasActiveFilters =
    statusFilter !== 'all' ||
    requestTypeFilter !== 'all' ||
    dateRange !== 'all' ||
    debouncedSearch.length > 0

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(total, page * pageSize)

  const metricCards: Array<{
    key: string
    label: string
    value: number
    targetStatus: QuoteStatus | 'all'
    accentClass: string
  }> = [
    {
      key: 'total',
      label: 'Total Quotations',
      value: metrics.total,
      targetStatus: 'all',
      accentClass: 'text-gray-900',
    },
    {
      key: 'submitted',
      label: 'New Submissions',
      value: metrics.submitted,
      targetStatus: 'submitted',
      accentClass: 'text-orange-700',
    },
    {
      key: 'reviewing',
      label: 'Under Review',
      value: metrics.reviewing,
      targetStatus: 'reviewing',
      accentClass: 'text-amber-700',
    },
    {
      key: 'quoted',
      label: 'Quoted',
      value: metrics.quoted,
      targetStatus: 'quoted',
      accentClass: 'text-emerald-700',
    },
    {
      key: 'closed',
      label: 'Rejected / Expired',
      value: metrics.rejectedOrExpired,
      targetStatus: 'rejected',
      accentClass: 'text-gray-600',
    },
  ]

  return (
    <div className="space-y-6" data-testid="admin-quotes-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Quotation Requests
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review, prepare and manage customer quotation requests.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 self-start sm:self-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metricCards.map((card) => {
          const isSelected =
            card.targetStatus === statusFilter &&
            !(card.key === 'closed' && statusFilter === 'expired')
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                setPage(1)
                setStatusFilter((prev) =>
                  prev === card.targetStatus && card.targetStatus !== 'all'
                    ? 'all'
                    : card.targetStatus
                )
              }}
              className={`text-left rounded-xl border p-4 bg-white transition-colors ${
                isSelected
                  ? 'border-orange-400 ring-1 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={`text-2xl font-semibold tabular-nums mt-1 ${card.accentClass}`}>
                {card.value}
              </p>
            </button>
          )
        })}
      </div>

      {/* Search & Filter Controls */}
      <Card className="border-gray-200 shadow-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                aria-label="Search quotation requests"
                placeholder="Search quote #, customer, company, email, phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-9 pl-9 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setPage(1)
                setStatusFilter(e.target.value as QuoteStatus | 'all')
              }}
              className="md:col-span-2 h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:border-orange-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewing">Under Review</option>
              <option value="quoted">Quoted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            <select
              aria-label="Filter by request type"
              value={requestTypeFilter}
              onChange={(e) => {
                setPage(1)
                setRequestTypeFilter(e.target.value as typeof requestTypeFilter)
              }}
              className="md:col-span-2 h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:border-orange-500 outline-none"
            >
              <option value="all">All Request Types</option>
              <option value="general">General Enquiry</option>
              <option value="single">Single Product</option>
              <option value="bulk">Multiple Products</option>
            </select>

            <select
              aria-label="Filter by submission date"
              value={dateRange}
              onChange={(e) => {
                setPage(1)
                setDateRange(e.target.value as typeof dateRange)
              }}
              className="md:col-span-2 h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:border-orange-500 outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
            </select>

            <select
              aria-label="Sort quotations"
              value={sortBy}
              onChange={(e) => {
                setPage(1)
                setSortBy(e.target.value as typeof sortBy)
              }}
              className="md:col-span-2 h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:border-orange-500 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_total">Highest Total</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {total} {total === 1 ? 'matching quotation' : 'matching quotations'}
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-orange-600 hover:underline font-medium"
              >
                Reset filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center justify-center gap-3 text-gray-500">
          <LoaderCircle className="w-7 h-7 animate-spin text-orange-600" />
          <span className="text-sm">Loading quotation requests...</span>
        </div>
      ) : loadError ? (
        <Card className="border-red-200 shadow-none">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">Could not load quotations</p>
              <p className="text-xs text-gray-600 mt-1">{loadError}</p>
            </div>
            <Button size="sm" variant="outline" onClick={loadQuotes}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : quotes.length === 0 ? (
        <Card className="border-gray-200 shadow-none">
          <CardContent className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-semibold text-gray-900">No quotations found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {hasActiveFilters
                ? 'No quotation requests match your current search or filter criteria.'
                : 'Customer quotation requests will appear here as they are submitted.'}
            </p>
            {hasActiveFilters && (
              <Button size="sm" variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden lg:block border-gray-200 shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Quote Number</th>
                    <th className="text-left px-4 py-3 font-medium">Customer</th>
                    <th className="text-left px-4 py-3 font-medium">Contact</th>
                    <th className="text-left px-4 py-3 font-medium">Request</th>
                    <th className="text-center px-3 py-3 font-medium">Items</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Submitted</th>
                    <th className="text-right px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quotes.map((quote) => {
                    const statusConfig = getStatusConfig(quote.status)
                    const itemCount = quote.items?.length || 0
                    const reqBadge = getRequestTypeBadge(quote.request_type, itemCount)
                    const ReqIcon = reqBadge.icon
                    const customerName =
                      quote.requester_name ||
                      quote.guest_name ||
                      quote.company_details?.contact_name ||
                      'Customer'
                    const customerEmail = quote.requester_email || quote.guest_email || '—'
                    const customerPhone =
                      quote.requester_phone ||
                      quote.guest_phone ||
                      quote.company_details?.contact_phone ||
                      null
                    const companyName = quote.company_name || quote.company_details?.company_name || null
                    const submittedDate = new Date(quote.created_at)

                    return (
                      <tr key={quote.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/admin/quotes/${quote.id}`}
                              title={quote.quote_number}
                              className="font-mono font-medium text-gray-900 hover:text-orange-600 transition-colors"
                            >
                              {quote.quote_number}
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleCopyQuoteNumber(quote.id, quote.quote_number)}
                              title="Copy quotation reference"
                              aria-label={`Copy ${quote.quote_number}`}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              {copiedId === quote.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-medium text-gray-900">{customerName}</p>
                          {companyName && (
                            <p className="text-xs text-gray-600 mt-0.5">{companyName}</p>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="text-gray-800 truncate max-w-[200px]" title={customerEmail}>
                            {customerEmail}
                          </p>
                          {customerPhone && (
                            <p className="text-xs text-gray-500 mt-0.5 tabular-nums">{customerPhone}</p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs border ${reqBadge.color}`}
                          >
                            <ReqIcon className="w-3 h-3 shrink-0" />
                            <span>{reqBadge.label}</span>
                          </span>
                        </td>

                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <span className="text-gray-900 tabular-nums">{itemCount}</span>
                          {quote.estimated_total && Number(quote.estimated_total) > 0 && (
                            <p className="text-xs text-gray-500 tabular-nums mt-0.5">
                              {formatINR(quote.estimated_total)}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-xs font-medium text-gray-800">
                            {format(submittedDate, 'dd MMM yyyy')}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {formatDistanceToNow(submittedDate, { addSuffix: true })}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/quotes/${quote.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors"
                          >
                            <span>View</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Tablet & Mobile Structured Cards */}
          <div className="lg:hidden space-y-3">
            {quotes.map((quote) => {
              const statusConfig = getStatusConfig(quote.status)
              const itemCount = quote.items?.length || 0
              const reqBadge = getRequestTypeBadge(quote.request_type, itemCount)
              const ReqIcon = reqBadge.icon
              const customerName =
                quote.requester_name ||
                quote.guest_name ||
                quote.company_details?.contact_name ||
                'Customer'
              const customerEmail = quote.requester_email || quote.guest_email || '—'
              const customerPhone =
                quote.requester_phone ||
                quote.guest_phone ||
                quote.company_details?.contact_phone ||
                null
              const companyName = quote.company_name || quote.company_details?.company_name || null
              const submittedDate = new Date(quote.created_at)

              return (
                <Card key={quote.id} className="border-gray-200 shadow-none">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link
                          href={`/admin/quotes/${quote.id}`}
                          className="font-mono text-sm font-medium text-gray-900 hover:text-orange-600 truncate"
                        >
                          {quote.quote_number}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCopyQuoteNumber(quote.id, quote.quote_number)}
                          aria-label={`Copy ${quote.quote_number}`}
                          className="p-1 text-gray-400 hover:text-gray-700"
                        >
                          {copiedId === quote.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border shrink-0 ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{customerName}</p>
                        {companyName && <p className="text-xs text-gray-600">{companyName}</p>}
                      </div>
                      <div className="text-xs text-gray-600 sm:text-right">
                        <p className="truncate">{customerEmail}</p>
                        {customerPhone && <p className="tabular-nums mt-0.5">{customerPhone}</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${reqBadge.color}`}
                        >
                          <ReqIcon className="w-3 h-3" />
                          <span>{reqBadge.label}</span>
                        </span>
                        <span>
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                        {quote.estimated_total && Number(quote.estimated_total) > 0 && (
                          <span className="font-medium text-gray-900 tabular-nums">
                            · {formatINR(quote.estimated_total)}
                          </span>
                        )}
                      </div>
                      <span>{format(submittedDate, 'dd MMM yyyy')}</span>
                    </div>

                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors"
                    >
                      <span>View Quotation</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-600">
            <span className="tabular-nums">
              Showing {rangeStart}–{rangeEnd} of {total} quotations (Page {page} of {totalPages})
            </span>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
