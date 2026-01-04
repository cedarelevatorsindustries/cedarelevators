"use client"

import Link from "next/link"
import { CircleHelp } from "lucide-react"

export default function HelpSection() {
  return (
    <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <CircleHelp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Need Help with Quotes?
          </h3>
          <p className="text-gray-600 mb-4">
            Our team is here to assist you with quote requests, pricing questions, and approval workflows.
          </p>
          <div className="flex gap-3">
            <Link
              href="/help/quotes"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Quote Guide
            </Link>
            <Link
              href="/contact"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

