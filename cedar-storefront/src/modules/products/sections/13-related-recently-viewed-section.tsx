"use client"

import { HttpTypes } from "@medusajs/types"
import ProductCard from "@/components/ui/product-card"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface CatalogContext {
  from?: string
  category?: string
  application?: string
  search?: string
}

interface RelatedRecentlyViewedSectionProps {
  relatedProducts: HttpTypes.StoreProduct[]
  recentlyViewedProducts?: HttpTypes.StoreProduct[]
  catalogContext?: CatalogContext
  isMobile?: boolean
}

export default function RelatedRecentlyViewedSection({
  relatedProducts,
  recentlyViewedProducts = [],
  catalogContext,
  isMobile = false
}: RelatedRecentlyViewedSectionProps) {
  const getBackUrl = () => {
    if (catalogContext?.category) return `/catalog?category=${catalogContext.category}`
    if (catalogContext?.application) return `/catalog?application=${catalogContext.application}`
    if (catalogContext?.search) return `/catalog?search=${catalogContext.search}`
    return "/catalog"
  }

  const hasRelated = relatedProducts.length > 0
  const hasRecent = recentlyViewedProducts.length > 0

  if (!hasRelated && !hasRecent) return null

  return (
    <div className="space-y-12">
      {/* Related Products */}
      {hasRelated && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Related Products</h2>
            <Link
              href={getBackUrl()}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isMobile ? (
            // Mobile: Horizontal Scroll with mobile variant cards
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {relatedProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[160px]">
                  <ProductCard
                    product={product}
                    variant="mobile"
                  />
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Grid layout
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="default"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recently Viewed */}
      {hasRecent && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Recently Viewed</h2>
          </div>
          
          {isMobile ? (
            // Mobile: Horizontal Scroll
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {recentlyViewedProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[160px]">
                  <ProductCard
                    product={product}
                    variant="mobile"
                  />
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Grid layout
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentlyViewedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="default"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
