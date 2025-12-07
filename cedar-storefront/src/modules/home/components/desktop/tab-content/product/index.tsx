"use client"

import { HttpTypes } from "@medusajs/types"
import FavoritesSection from "./sections/favorites-section"
import RecentlyViewedSection from "./sections/recently-viewed-section"
import RecommendedSection from "./sections/recommended-section"
import TopChoicesSection from "./sections/top-choices-section"
import NewArrivalsSection from "./sections/new-arrivals-section"
import HelpSection from "./sections/help-section"

interface ProductsTabProps {
  products?: HttpTypes.StoreProduct[]
}

export default function ProductsTab({ products = [] }: ProductsTabProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      <FavoritesSection products={products} />
      <RecentlyViewedSection products={products} />
      <RecommendedSection products={products} />
      <TopChoicesSection products={products} />
      <NewArrivalsSection products={products} />
      <HelpSection />
    </div>
  )
}
