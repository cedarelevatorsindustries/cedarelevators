"use client"

import { CircleHelp } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

export default function HelpSection() {
  return (
    <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <CircleHelp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Need help finding a product?
          </h3>
          <p className="text-gray-600 mb-4">
            Our team is here to help you find the right products for your needs.
          </p>
          <div className="flex gap-3">
            <LocalizedClientLink
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Contact Support
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/help"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Help Center
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}

