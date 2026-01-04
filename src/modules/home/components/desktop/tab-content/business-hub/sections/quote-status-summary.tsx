"use client"

import { useState, useEffect } from "react"
import { Clock, CircleCheck, AlertCircle, LoaderCircle } from "lucide-react"
import { getQuotes } from "@/lib/actions/quotes"
import { Quote } from "@/types/b2b/quote"

export default function QuoteStatusSummary() {
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    reviewing: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStatusCounts() {
      try {
        const result = await getQuotes({ status: 'all' })

        if (result.success && result.quotes) {
          const counts = {
            pending: result.quotes.filter(q => q.status === 'pending').length,
            approved: result.quotes.filter(q => q.status === 'approved').length,
            reviewing: result.quotes.filter(q => q.status === 'reviewing').length
          }
          setStatusCounts(counts)
        }
      } catch (error) {
        console.error('Error loading quote status summary:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStatusCounts()
  }, [])

  if (isLoading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quote Status Summary</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-12 flex items-center justify-center">
          <LoaderCircle className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quote Status Summary</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-3xl font-bold text-yellow-600">{statusCounts.pending}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Pending</h3>
          <p className="text-sm text-gray-600">Awaiting review</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CircleCheck className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">{statusCounts.approved}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Approved</h3>
          <p className="text-sm text-gray-600">Ready to order</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">{statusCounts.reviewing}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">In Review</h3>
          <p className="text-sm text-gray-600">Being processed</p>
        </div>
      </div>
    </section>
  )
}
