"use client"

import { CircleHelp } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

export default function CategoryHelp() {
  return (
    <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <CircleHelp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Can't find your category?
          </h3>
          <p className="text-gray-600 mb-4">
            Let us help you find the right category for your needs.
          </p>
          <LocalizedClientLink
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Contact Support
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
