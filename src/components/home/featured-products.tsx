"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
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
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
              Verified Components
            </span>
            <h2 className="text-xl sm:text-3xl font-semibold text-zinc-900 tracking-tight mt-0.5 sm:mt-1">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-0.5 sm:mt-1 hidden sm:block">
              Engineered components ready for quotation and site dispatch.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 hover:text-blue-600 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
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
