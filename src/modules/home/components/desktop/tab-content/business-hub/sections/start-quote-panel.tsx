"use client"

import { Plus, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function StartQuotePanel() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Need a Custom Quote?</h2>
          <p className="text-blue-100 mb-4">
            Get personalized pricing for bulk orders and special requirements.
          </p>
          <ul className="space-y-2 text-blue-100 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Volume discounts available
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Custom specifications supported
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Fast turnaround time
            </li>
          </ul>
        </div>
        <Link
          href="/request-quote"
          className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Start New Quote
        </Link>
      </div>
    </section>
  )
}
