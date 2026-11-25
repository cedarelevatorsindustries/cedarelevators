"use client"

import type { Product } from "@/lib/types/domain"
import ProductCard from "@/components/ui/product-card"

interface FeaturedProductsProps {
  products?: Product[]
}

export function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const displayProducts = (products.length > 0 ? products : []).slice(0, 8)

  return (
    <section id="featured-products" className="w-full py-8 sm:py-14 bg-white">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header with Orange & Blue Theme */}
        <div className="mb-6 sm:mb-8">
          <h2 className="type-section text-zinc-900">
            Featured Products
          </h2>
          <p className="type-body-sm text-zinc-600 mt-1 hidden sm:block">
            Engineered components ready for quotation and site dispatch.
          </p>
        </div>

        {/* Responsive Grid with Reverted Classic Product Card */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="default" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
