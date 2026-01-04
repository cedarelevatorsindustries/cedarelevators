"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, CircleCheck, AlertCircle, FileText, LoaderCircle } from "lucide-react"
import { getQuotes } from "@/lib/actions/quotes"
import { Quote, QuoteStatus } from "@/types/b2b/quote"
import { formatDistanceToNow } from "date-fns"

const getStatusConfig = (status: QuoteStatus) => {
  switch (status) {
    case "pending":
      return { bgColor: "bg-yellow-100", textColor: "text-yellow-600", icon: Clock, label: "Pending" }
    case "approved":
      return { bgColor: "bg-green-100", textColor: "text-green-600", icon: CircleCheck, label: "Approved" }
    case "reviewing":
      return { bgColor: "bg-blue-100", textColor: "text-blue-600", icon: AlertCircle, label: "In Review" }
    case "rejected":
      return { bgColor: "bg-red-100", textColor: "text-red-600", icon: AlertCircle, label: "Rejected" }
    default:
      return { bgColor: "bg-gray-100", textColor: "text-gray-600", icon: FileText, label: status }
  }
}

interface RecentQuotesProps {
  isVerified?: boolean
}

export default function RecentQuotes({ isVerified = false }: RecentQuotesProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadQuotes() {
      try {
        const result = await getQuotes({ status: 'all' })

        if (result.success && result.quotes) {
          // Get only the 3 most recent quotes
          setQuotes(result.quotes.slice(0, 3))
        }
      } catch (error) {
        console.error('Error loading recent quotes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuotes()
  }, [])

  if (isLoading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Quotes</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-12 flex items-center justify-center">
          <LoaderCircle className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Recent Quotes</h2>
        <Link href="/quotes" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All Quotes →
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No quotes yet</h3>
          <p className="text-sm text-gray-600 mb-4">Start by requesting a quote for products you need</p>
          <Link
            href="/quotes/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Request Quote
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y">
          {quotes.map((quote) => {
            const statusConfig = getStatusConfig(quote.status)
            const StatusIcon = statusConfig.icon

            return (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${statusConfig.bgColor} rounded-lg flex items-center justify-center`}>
                      <StatusIcon className={`w-6 h-6 ${statusConfig.textColor}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Quote #{quote.quote_number}</h3>
                      <p className="text-sm text-gray-600">
                        {quote.items?.length || 0} items • {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isVerified && quote.estimated_total > 0 ? (
                      <p className="text-lg font-semibold text-gray-900 mb-1">
                        ₹{quote.estimated_total.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-lg font-semibold text-gray-400 mb-1">-</p>
                    )}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

