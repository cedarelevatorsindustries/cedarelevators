"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"

export default function QuickQuoteSection() {
  return (
    <div className="px-4 pt-8 bg-gray-50">
      <div className="rounded-lg bg-white p-6 text-center border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">
          Need a Custom or Bulk Order?
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Get a detailed quote within 24 business hours.
        </p>
        <LocalizedClientLink
          href="/request-quote"
          className="mt-4 flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-blue-500 hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">REQUEST QUOTE NOW</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
