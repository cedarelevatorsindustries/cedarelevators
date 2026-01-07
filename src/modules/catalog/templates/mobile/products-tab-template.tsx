"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { useState } from "react"
import { SlidersHorizontal, ArrowUpDown } from "lucide-react"
import ProductSectionHorizontal from "../../sections/mobile/product-section-horizontal"
import ProductCard from "@/components/ui/product-card"
import { BannerWithSlides } from "@/lib/types/banners"
import { BannerCarousel } from "../../components/banner-carousel"

interface ProductsTabProps {
  products: Product[]
  banners?: BannerWithSlides[]
}

export default function ProductsTabTemplate({ products, banners = [] }: ProductsTabProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)

  return (
    <div className="pb-20">
      {/* Banner - Only show if banners exist */}
      {banners.length > 0 && (
        <div className="p-4">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* All Products - Infinite Scroll Grid with Filter Bar */}
      <div className="mt-6 bg-white">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900 mb-3">All Products</h2>

          {/* Filter Bar */}

        </div>

        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="mobile" />
          ))}
        </div>
      </div>
    </div>
  )
}

