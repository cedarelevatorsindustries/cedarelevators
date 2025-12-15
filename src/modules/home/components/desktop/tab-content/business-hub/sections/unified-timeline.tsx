"use client"

import { MessageSquare, Filter } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { useState } from "react"

interface TimelineItem {
  id: string
  type: "quote" | "order"
  title: string
  amount: string
  status: string
  statusColor: string
  date: string
  actions: { label: string; variant: "primary" | "secondary" }[]
  hasMessage?: boolean
}

export default function UnifiedTimeline() {
  const [filter, setFilter] = useState<"all" | "quote" | "order">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const timelineItems: TimelineItem[] = [
    {
      id: "Q-2345",
      type: "quote",
      title: "Quote #Q-2345 (Residential Lifts)",
      amount: "₹2,50,000",
      status: "Pending",
      statusColor: "text-orange-600 bg-orange-50",
      date: "Awaiting Approval",
      actions: [
        { label: "Remind CEDAR Team", variant: "secondary" },
        { label: "Convert to Order", variant: "primary" }
      ],
      hasMessage: true
    },
    {
      id: "O-1234",
      type: "order",
      title: "Order #O-1234 (Commercial Elevators)",
      amount: "₹5,00,000",
      status: "Approved",
      statusColor: "text-green-600 bg-green-50",
      date: "Ready for Dispatch",
      actions: [
        { label: "Track Order", variant: "primary" }
      ],
      hasMessage: true
    }
  ]

  const filteredItems = timelineItems.filter(item => {
    if (filter !== "all" && item.type !== filter) return false
    if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter) return false
    return true
  })

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Smart Quote & Order Timeline</h2>
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("quote")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === "quote" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Quotes
            </button>
            <button
              onClick={() => setFilter("order")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === "order" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Orders
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
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
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
          <Filter size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No items match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${item.statusColor}`}>
                    {item.status}
                  </span>
                  {item.hasMessage && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MessageSquare size={14} className="text-green-600" />
                      <span>New message from CEDAR</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Amount: <span className="font-semibold text-gray-900">{item.amount}</span></span>
                  <span>Status: {item.date}</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            <div className="flex gap-3">
              {item.actions.map((action, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    action.variant === "primary"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          ))}
        </div>
      )}
    </section>
  )
}
