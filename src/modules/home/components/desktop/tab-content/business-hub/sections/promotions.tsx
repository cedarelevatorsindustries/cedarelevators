"use client"

import Link from "next/link"
import { TrendingUp } from "lucide-react"

export default function Promotions() {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
      <div className="flex items-center gap-4 flex-wrap">
        <TrendingUp className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Special Pricing for Bulk Orders</h3>
          <p className="text-orange-100">
            Request a quote for orders over ₹10,00,000 and get exclusive volume discounts up to 20% off.
          </p>
        </div>
        <Link
          href="/request-quote"
          className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          Get Quote
        </Link>
      </div>
    </section>
  )
}
