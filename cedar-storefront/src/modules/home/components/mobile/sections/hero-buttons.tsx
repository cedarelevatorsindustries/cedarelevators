"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"

export default function HeroButtonsSection() {
  return (
    <div className="flex justify-center pt-6 bg-gray-50">
      <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px] justify-center">
        <LocalizedClientLink
          href="/request-quote"
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-orange-500 hover:bg-orange-600 text-white text-base font-bold leading-normal tracking-[0.015em] grow shadow-md"
        >
          <span className="truncate">GET A QUOTE</span>
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/catalog"
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-blue-500 hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] grow shadow-md"
        >
          <span className="truncate">BROWSE PRODUCTS</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
