"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { useState } from "react"
import { SlidersHorizontal, ArrowUpDown } from "lucide-react"
import ProductSectionHorizontal from "../../sections/mobile/product-section-horizontal"
import ProductCard from "@/components/ui/product-card"

interface ProductsTabProps {
  products: Product[]
}

export default function ProductsTabTemplate({ products }: ProductsTabProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)

  // Organize products into sections
  const trending = products.slice(0, 5)
  const newArrivals = products.slice(5, 10)
  const topChoices = products.slice(10, 15)
  const bestSellers = products.slice(15, 20)
  const recommended = products.slice(20, 25)
  const recentlyViewed = products.slice(25, 30)
  const favorites = products.slice(30, 35)
  const exclusiveBusiness = products.slice(35, 40)
  const limitedStock = products.slice(40, 45)
  const seasonal = products.slice(45, 50)
  const featured = products.slice(50, 55)

  return (
    <div className="pb-20">
      {/* Banner - Smaller with Rounded Corners */}
      <div className="p-4">
        <div className="relative aspect-[16/6] rounded-xl overflow-hidden">
          <img
            src="/images/image.png"
            alt="Catalog Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
            <div className="px-6">
              <h2 className="text-white text-xl font-bold mb-1">Premium Elevator Components</h2>
              <p className="text-white/90 text-sm">Browse our complete catalog</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Sections - Horizontal Scroll */}
      <div className="space-y-2">
        <ProductSectionHorizontal
          title="🔥 Trending Now"
          products={trending}
          viewAllLink="/catalog?filter=trending"
        />

        <ProductSectionHorizontal
          title="✨ New Arrivals"
          products={newArrivals}
          viewAllLink="/catalog?filter=new"
        />

        <ProductSectionHorizontal
          title="⭐ Top Choices This Month"
          products={topChoices}
          viewAllLink="/catalog?filter=top-choices"
        />

        <ProductSectionHorizontal
          title="🏆 Best Sellers"
          products={bestSellers}
          viewAllLink="/catalog?filter=best-sellers"
        />

        <ProductSectionHorizontal
          title="💡 Recommended for You"
          products={recommended}
          viewAllLink="/catalog?filter=recommended"
        />

        <ProductSectionHorizontal
          title="👁️ Recently Viewed"
          products={recentlyViewed}
          viewAllLink="/catalog?filter=recent"
        />

        <ProductSectionHorizontal
          title="❤️ Your Favorites"
          products={favorites}
          viewAllLink="/account/wishlist"
        />

        <ProductSectionHorizontal
          title="💼 Exclusive to Business"
          products={exclusiveBusiness}
          viewAllLink="/catalog?filter=business-exclusive"
        />

        <ProductSectionHorizontal
          title="⚡ Limited Stock"
          products={limitedStock}
          viewAllLink="/catalog?filter=limited"
        />

        <ProductSectionHorizontal
          title="🎯 Seasonal Picks"
          products={seasonal}
          viewAllLink="/catalog?filter=seasonal"
        />

        <ProductSectionHorizontal
          title="🌟 Featured Products"
          products={featured}
          viewAllLink="/catalog?filter=featured"
        />
      </div>

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
