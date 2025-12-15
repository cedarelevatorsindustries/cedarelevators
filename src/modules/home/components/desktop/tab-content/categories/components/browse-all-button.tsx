"use client"

import { Grid3X3 } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

export default function BrowseAllButton() {
  return (
    <section className="text-center">
      <LocalizedClientLink
        href="/categories"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors"
      >
        <Grid3X3 className="w-5 h-5" />
        Explore All Categories
      </LocalizedClientLink>
    </section>
  )
}
