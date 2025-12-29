'use client'

import { useState, useMemo, useEffect } from 'react'
import { Quote, QuoteStatus, QuoteFilters, QuoteStats } from '@/types/b2b/quote'
import { 
  FileText, Download, Search, Filter, Eye, MessageSquare, 
  RefreshCw, X, Calendar, TrendingUp, Clock, CircleCheck,
  AlertCircle, XCircle, Plus, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import RecommendedProducts from '../recommended-products'

interface QuotesSectionProps {
  accountType: 'guest' | 'individual' | 'business'
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
}

export default function QuotesSection({ accountType, verificationStatus }: QuotesSectionProps) {
  const [filters, setFilters] = useState<QuoteFilters>({
    status: 'all',
    date_range: 'last_30_days',
    search: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [stats, setStats] = useState<QuoteStats>({
    total_quotes: 0,
    active_quotes: 0,
    total_value: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch quotes and stats
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const { getQuotes, getQuoteStats } = await import('@/lib/actions/quotes')
        
        const [quotesResult, statsResult] = await Promise.all([
          getQuotes(filters),
          getQuoteStats(),
        ])

        if (quotesResult.success && quotesResult.quotes) {
          setQuotes(quotesResult.quotes)
        }

        if (statsResult.success && statsResult.stats) {
          setStats(statsResult.stats)
        }
      } catch (error) {
        console.error('Error fetching quotes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters])

  const isVerified = accountType === 'business' && verificationStatus === 'approved'
  const canRequestQuote = isVerified

  // Quotes are already filtered by the server action
  const filteredQuotes = quotes

  const handleDownloadCSV = async () => {
    try {
      const { exportQuotesToCSV } = await import('@/lib/actions/quotes')
      const result = await exportQuotesToCSV(filters)

      if (result.success && result.csv) {
        // Create download link
        const blob = new Blob([result.csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('Failed to download CSV')
    }
  }

  const getStatusBadge = (status: QuoteStatus) => {
    const configs = {
      pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400', icon: Clock },
      negotiation: { label: 'Negotiation', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: MessageSquare },
      revised: { label: 'Revised', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: RefreshCw },
      accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: CircleCheck },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
      expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400', icon: AlertCircle },
    }
    return configs[status]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Show upgrade message for individual users
  if (accountType === 'individual') {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/10 rounded-xl p-8 border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upgrade to Business Account
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Get custom quotes, bulk pricing, and dedicated support for your business needs.
              </p>
              <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    )
  }

  // Show verification required message
  if (!isVerified) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-8 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <AlertCircle className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Complete Verification to Request Quotes
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Verify your business to unlock quote requests and access B2B pricing.
              </p>
              <Link
                href="/account/verification"
                className="inline-block px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
              >
                Complete Verification
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">My Quotes</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your quote requests and track responses
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quotes</span>
            <FileText className="text-gray-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : stats.total_quotes}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Quotes</span>
            <TrendingUp className="text-orange-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : stats.active_quotes}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</span>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : formatCurrency(stats.total_value)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/quotes/request"
          className={cn(
            'px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2',
            canRequestQuote
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          <Plus size={20} />
          Request New Quote
        </Link>

        <button 
          onClick={handleDownloadCSV}
          className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          Download All Quotes
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Quote ID / Product"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="negotiation">Negotiation</option>
            <option value="revised">Revised</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.date_range}
            onChange={(e) => setFilters({ ...filters, date_range: e.target.value as any })}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="last_90_days">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Quotes Table - Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Quote ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredQuotes.map((quote) => {
                const statusConfig = getStatusBadge(quote.status)
                const StatusIcon = statusConfig.icon

                return (
                  <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/profile/quotes/${quote.quote_number}`}
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                      >
                        #{quote.quote_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(quote.requested_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {quote.items.length || 12}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(quote.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', statusConfig.color)}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/profile/quotes/${quote.quote_number}`}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        {quote.status === 'negotiation' && (
                          <button
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Chat"
                          >
                            <MessageSquare size={18} />
                          </button>
                        )}
                        {quote.status === 'accepted' && (
                          <button
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Reorder"
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotes Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredQuotes.map((quote) => {
          const statusConfig = getStatusBadge(quote.status)
          const StatusIcon = statusConfig.icon

          return (
            <div
              key={quote.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <Link
                  href={`/profile/quotes/${quote.quote_number}`}
                  className="text-base font-semibold text-orange-600 hover:text-orange-700"
                >
                  #{quote.quote_number}
                </Link>
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', statusConfig.color)}>
                  <StatusIcon size={14} />
                  {statusConfig.label}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatDate(quote.requested_date)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Items:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{quote.items.length || 12}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/profile/quotes/${quote.quote_number}`}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors text-center"
                >
                  View Details
                </Link>
                {quote.status === 'negotiation' && (
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors">
                    <MessageSquare size={18} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredQuotes.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No quotes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filters.search || filters.status !== 'all'
              ? 'Try adjusting your filters'
              : 'Request your first quote to get started'}
          </p>
          {canRequestQuote && (
            <Link
              href="/quotes/request"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus size={20} />
              Request New Quote
            </Link>
          )}
        </div>
      )}

      {/* Recommended Products - Only on Quotes page */}
      {filteredQuotes.length > 0 && (
        <div className="border-t pt-8 mt-12">
          <RecommendedProducts />
        </div>
      )}
      </div>
    </div>
  )
}
