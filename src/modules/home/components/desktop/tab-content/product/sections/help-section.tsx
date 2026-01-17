"use client"

import { CircleHelp } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

export default function HelpSection() {
  return (
    <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <CircleHelp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Need help finding a product?
            </h3>
            <p className="text-gray-600 mt-1">
              Our team is here to help you find the right products for your needs.
            </p>
          </div>
        </div>

        <LocalizedClientLink
          href="/contact"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          Contact Support
        </LocalizedClientLink>
      </div>
    </section>
  )
}

