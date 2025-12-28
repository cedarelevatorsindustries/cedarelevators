"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import ProductCard from "@/components/ui/product-card"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface RecommendedSectionProps {
  products: Product[]
}

export default function RecommendedSection({ products }: RecommendedSectionProps) {
  const recommendedProducts = products.slice(0, 5)

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Recommended for You</h2>
        <LocalizedClientLink
          href="/catalog?type=recommended"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </LocalizedClientLink>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommendedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
