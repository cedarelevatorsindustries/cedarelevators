"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Filter, Loader2, FileText, ShoppingCart } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { getQuotes } from "@/lib/actions/quotes"
import { Quote, QuoteStatus } from "@/types/b2b/quote"
import { formatDistanceToNow } from "date-fns"

interface TimelineItem {
  id: string
  type: "quote" | "order"
  quote_number: string
  title: string
  amount: string
  status: QuoteStatus
  statusColor: string
  date: string
  hasNewMessage?: boolean
  itemCount: number
}

const getStatusConfig = (status: QuoteStatus) => {
  switch (status) {
    case 'pending':
      return { color: 'text-orange-600 bg-orange-50', label: 'Pending' }
    case 'in_review':
      return { color: 'text-blue-600 bg-blue-50', label: 'In Review' }
    case 'negotiation':
      return { color: 'text-purple-600 bg-purple-50', label: 'Negotiation' }
    case 'revised':
      return { color: 'text-indigo-600 bg-indigo-50', label: 'Revised' }
    case 'accepted':
      return { color: 'text-green-600 bg-green-50', label: 'Accepted' }
    case 'rejected':
      return { color: 'text-red-600 bg-red-50', label: 'Rejected' }
    case 'expired':
      return { color: 'text-gray-600 bg-gray-50', label: 'Expired' }
    case 'converted':
      return { color: 'text-emerald-600 bg-emerald-50', label: 'Converted' }
    default:
      return { color: 'text-gray-600 bg-gray-50', label: 'Unknown' }
  }
}

export default function UnifiedTimeline() {
  const [filter, setFilter] = useState<"all" | "quote" | "order">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadQuotes() {
      try {
        const result = await getQuotes({
          status: statusFilter === 'all' ? 'all' : statusFilter as QuoteStatus,
          date_range: 'all',
          search: ''
        })
        if (result.success) {
          setQuotes(result.quotes)
        }
      } catch (error) {
        console.error('Error loading quotes:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadQuotes()
  }, [statusFilter])

  const timelineItems: TimelineItem[] = quotes.map(quote => ({
    id: quote.id,
    type: "quote" as const,
    quote_number: quote.quote_number,
    title: `Quote #${quote.quote_number}`,
    amount: quote.estimated_total > 0 ? `₹${quote.estimated_total.toLocaleString()}` : 'Pending',
    status: quote.status,
    statusColor: getStatusConfig(quote.status).color,
    date: formatDistanceToNow(new Date(quote.created_at), { addSuffix: true }),
    hasNewMessage: quote.messages && quote.messages.length > 0,
    itemCount: quote.items?.length || 0
  }))

  const filteredItems = timelineItems.filter(item => {
    if (filter !== "all" && item.type !== filter) return false
    return true
  })

  if (isLoading) {
    return (
      <section className="mx-4 mt-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  return (
    <section className="mx-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Smart Quote & Order Timeline</h2>
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("quote")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "quote" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Quotes
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <LocalizedClientLink
            href="/profile/quotes"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </LocalizedClientLink>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
          <p className="text-gray-600 mb-4">Start a quote request to see your quotes here.</p>
          <LocalizedClientLink
            href="/request-quote"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Request Quote
          </LocalizedClientLink>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const statusConfig = getStatusConfig(item.status)
            return (
              <LocalizedClientLink
                key={item.id}
                href={`/quotes/${item.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {item.hasNewMessage && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MessageSquare size={14} className="text-green-600" />
                          <span>New message from CEDAR</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{item.itemCount} items</span>
                      <span>•</span>
                      <span>{item.amount}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {item.status === 'accepted' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        // TODO: Implement convert to order
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      Convert to Order
                    </button>
                  )}
                  {item.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        // TODO: Send reminder
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors"
                    >
                      Send Reminder
                    </button>
                  )}
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      )}
    </section>
  )
}
