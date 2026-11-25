'use client'

import { useState, useEffect, useCallback } from 'react'
import { Quote, QuoteStatus } from '@/types/b2b/quote'
import { getAdminQuotes, updateQuoteStatus } from '@/lib/actions/admin-quotes'
import {
  FileText,
  Search,
  LoaderCircle,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getStatusConfig, getRequestTypeBadge } from '@/domains/admin/components'
import { formatINR } from '@/lib/utils/quote-pricing'

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [requestTypeFilter, setRequestTypeFilter] = useState<'all' | 'general' | 'single' | 'bulk'>('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_total'>('newest')
  const [searchQuery, setSearchQuery] = useState('')

  const loadQuotes = useCallback(async () => {
    try {
      const result = await getAdminQuotes({
        status: statusFilter,
        request_type: requestTypeFilter,
        date_range: dateRange,
        search: searchQuery,
        sort: sortBy,
        page,
        pageSize,
      })

      if (result.success) {
        setQuotes(result.quotes || [])
        setTotal(result.total || 0)
      } else {
        setQuotes([])
        toast.error(result.error || 'Failed to load quotations')
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
      setQuotes([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [statusFilter, requestTypeFilter, dateRange, searchQuery, sortBy, page])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadQuotes()
  }

  const handleStartReview = async (quoteId: string) => {
    const result = await updateQuoteStatus(quoteId, 'reviewing')
    if (result.success) {
      toast.success('Quotation marked Under Review')
      loadQuotes()
    } else {
      toast.error(result.error || 'Failed to update status')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderCircle className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="admin-quotes-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quotations</h1>
          <p className="text-gray-600 mt-1">
            Review enquiries, prepare commercial pricing, and issue official quotation PDFs ({total} total)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-orange-200 text-orange-700 hover:bg-orange-50 self-start sm:self-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quote #, customer name, company, or email..."
                value={searchQuery}
                onChange={(e) => {
                  setPage(1)
                  setSearchQuery(e.target.value)
                }}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1)
                setStatusFilter(e.target.value as QuoteStatus | 'all')
              }}
              className="md:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewing">Under Review</option>
              <option value="quoted">Quoted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={requestTypeFilter}
              onChange={(e) => {
                setPage(1)
                setRequestTypeFilter(e.target.value as typeof requestTypeFilter)
              }}
              className="md:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <option value="all">All Types</option>
              <option value="general">General Enquiry</option>
              <option value="single">Single Product</option>
              <option value="bulk">Bulk Quote</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => {
                setPage(1)
                setDateRange(e.target.value as typeof dateRange)
              }}
              className="md:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="md:col-span-1 px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest_total">Value</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {quotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No quotations found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' || requestTypeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Incoming customer quotation requests will appear here.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase">Quote #</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase">Customer &amp; Company</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase">Items</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase">Submitted</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((quote) => {
                  const statusConfig = getStatusConfig(quote.status)
                  const reqBadge = getRequestTypeBadge(quote.request_type)
                  const ReqIcon = reqBadge.icon
                  const customerName = quote.requester_name || quote.guest_name || 'Guest'
                  const customerEmail = quote.requester_email || quote.guest_email || '-'
                  const companyName = quote.company_name || quote.company_details?.company_name

                  return (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/quotes/${quote.id}`}
                          className="font-mono font-semibold text-gray-900 hover:text-orange-600"
                        >
                          #{quote.quote_number}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{customerName}</p>
                        {companyName && <p className="text-xs font-medium text-gray-700">{companyName}</p>}
                        <p className="text-xs text-gray-500">{customerEmail}</p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${reqBadge.color}`}
                        >
                          <ReqIcon className="w-3 h-3" />
                          {reqBadge.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                        {quote.items?.length || 0}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                        {quote.estimated_total && Number(quote.estimated_total) > 0
                          ? formatINR(quote.estimated_total)
                          : '-'}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {(quote.status === 'submitted' || quote.status === 'pending') && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleStartReview(quote.id)}
                            >
                              Review
                            </Button>
                          )}
                          <Link href={`/admin/quotes/${quote.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Open
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50 text-sm">
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
