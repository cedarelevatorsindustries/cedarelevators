"use client"

import { HttpTypes } from "@medusajs/types"
import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface TopChoicesSectionProps {
  products: HttpTypes.StoreProduct[]
}

export default function TopChoicesSection({ products }: TopChoicesSectionProps) {
  const topProducts = products.slice(0, 5)
  
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Top Choices This Month</h2>
        <LocalizedClientLink
          href="/catalog?sort=popularity&from=top-choices"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </LocalizedClientLink>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {topProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
