"use client"

import Link from "next/link"
import { Clock, CheckCircle, AlertCircle, FileText } from "lucide-react"

const quotes = [
  { id: "QT-1234", status: "pending", items: 12, total: "₹15,420", date: "2 days ago" },
  { id: "QT-1235", status: "approved", items: 8, total: "₹8,950", date: "5 days ago" },
  { id: "QT-1236", status: "in-review", items: 15, total: "₹22,100", date: "1 week ago" }
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return { color: "yellow", icon: Clock, label: "Pending" }
    case "approved":
      return { color: "green", icon: CheckCircle, label: "Approved" }
    case "in-review":
      return { color: "blue", icon: AlertCircle, label: "In Review" }
    default:
      return { color: "gray", icon: FileText, label: "Unknown" }
  }
}

export default function RecentQuotes() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Recent Quotes</h2>
        <Link href="/account/quotes" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All Quotes →
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y">
        {quotes.map((quote) => {
          const statusConfig = getStatusConfig(quote.status)
          const StatusIcon = statusConfig.icon
          
          return (
            <Link
              key={quote.id}
              href={`/account/quotes/${quote.id}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-${statusConfig.color}-100 rounded-lg flex items-center justify-center`}>
                    <StatusIcon className={`w-6 h-6 text-${statusConfig.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Quote {quote.id}</h3>
                    <p className="text-sm text-gray-600">
                      {quote.items} items • {quote.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 mb-1">{quote.total}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
