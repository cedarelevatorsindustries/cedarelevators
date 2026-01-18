"use client"

import { useState, useEffect } from "react"
import { FileText, Package, LoaderCircle, Clock, CheckCircle, AlertCircle } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { getQuotes } from "@/lib/actions/quotes"
import { Quote } from "@/types/b2b/quote"

// Mock function to get orders - replace with actual API call when available
async function getOrders() {
  // TODO: Replace with actual order fetching logic
  return { success: true, orders: [] }
}

export default function QuotesOrdersSnapshot() {
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch recent quotes
        const quotesResult = await getQuotes({ status: 'all' })
        console.log('Quotes result:', quotesResult)

        if (quotesResult.success && quotesResult.quotes) {
          console.log('Found quotes:', quotesResult.quotes.length)
          // Get 3 most recent quotes
          setRecentQuotes(quotesResult.quotes.slice(0, 3))
        } else {
          console.error('Failed to fetch quotes:', quotesResult.error)
        }

        // Fetch recent orders
        const ordersResult = await getOrders()
        if (ordersResult.success && ordersResult.orders) {
          setRecentOrders(ordersResult.orders.slice(0, 3))
        }
      } catch (error) {
        console.error('Error loading snapshot data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <LoaderCircle className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      reviewing: { label: 'Reviewing', className: 'bg-blue-100 text-blue-800', icon: Clock },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: AlertCircle },
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: Clock }
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon size={12} />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const hasNoData = recentQuotes.length === 0 && recentOrders.length === 0

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quotes & Orders</h2>
        <div className="flex gap-2">
          <LocalizedClientLink
            href="/quotes"
            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
          >
            View All Quotes
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/profile/orders"
            className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
          >
            View All Orders
          </LocalizedClientLink>
        </div>
      </div>

      {hasNoData ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-2">No quotes or orders yet</p>
          <LocalizedClientLink
            href="/quotes/new"
            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Request your first quote →
          </LocalizedClientLink>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Quotes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-900">Recent Quotes</h3>
            </div>
            {recentQuotes.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No quotes yet</p>
            ) : (
              <div className="space-y-2">
                {recentQuotes.map((quote) => (
                  <LocalizedClientLink
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        #{quote.quote_number}
                      </span>
                      {getStatusBadge(quote.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{quote.items?.length || 0} item{quote.items?.length !== 1 ? 's' : ''}</span>
                      <span>{formatDate(quote.created_at)}</span>
                    </div>
                  </LocalizedClientLink>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <LocalizedClientLink
                    key={order.id}
                    href={`/profile/orders/${order.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>₹{order.total?.toLocaleString()}</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </LocalizedClientLink>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

