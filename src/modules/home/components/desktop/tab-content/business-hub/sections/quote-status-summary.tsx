"use client"

import { Clock, CircleCheck, AlertCircle } from "lucide-react"

export default function QuoteStatusSummary() {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quote Status Summary</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-3xl font-bold text-yellow-600">2</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Pending</h3>
          <p className="text-sm text-gray-600">Awaiting review</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CircleCheck className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">5</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Approved</h3>
          <p className="text-sm text-gray-600">Ready to order</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">1</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">In Review</h3>
          <p className="text-sm text-gray-600">Being processed</p>
        </div>
      </div>
    </section>
  )
}
