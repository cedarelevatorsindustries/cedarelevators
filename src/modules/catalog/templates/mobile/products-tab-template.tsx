"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { useState, useMemo } from "react"
import { SlidersHorizontal, ArrowUpDown } from "lucide-react"
import ProductSectionHorizontal from "../../sections/mobile/product-section-horizontal"
import ProductCard from "@/components/ui/product-card"
import { FilterBottomSheet } from "@/modules/catalog/components/filters"
import { BannerWithSlides } from "@/lib/types/banners"
import { BannerCarousel } from "../../components/banner-carousel"

interface ProductsTabProps {
  products: Product[]
  banners?: BannerWithSlides[]
  activeCollection?: any
}

export default function ProductsTabTemplate({ products, banners = [], activeCollection }: ProductsTabProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)

  // Filter products for collection display
  const { collectionProducts, otherProducts } = useMemo(() => {
    if (!activeCollection || !activeCollection.products) {
      return { collectionProducts: [], otherProducts: products }
    }

    const collectionProductIds = activeCollection.products.map((p: any) => {
      if (typeof p === 'object') {
        return p.product_id || p.product?.id || p.id
      }
      return p
    }).filter(Boolean)

    const inCollection = products.filter(p => collectionProductIds.includes(p.id))
    const notInCollection = products.filter(p => !collectionProductIds.includes(p.id))

    return { collectionProducts: inCollection, otherProducts: notInCollection }
  }, [products, activeCollection])

  return (
    <div className="pb-20">
      {/* Banner - Only show if banners exist */}
      {banners.length > 0 && (
        <div className="p-4">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* Collection Display - Two Sections */}
      {activeCollection ? (
        <>
          {/* Collection Title and Description */}
          <div className="px-4 py-4 bg-white">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {activeCollection.title || activeCollection.name}
            </h1>
            {activeCollection.description && (
              <p className="text-sm text-gray-600">{activeCollection.description}</p>
            )}
          </div>

          {/* Section 1: Collection Products */}
          {collectionProducts.length > 0 ? (
            <div className="mt-4 bg-white">
              <div className="px-4 py-3 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">
                    Products
                  </h2>
                  <span className="text-sm text-gray-600">{collectionProducts.length} items</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 px-4 py-4">
                {collectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="mobile" />
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-600">No products in this collection</p>
            </div>
          )}

          {/* Section 2: All Products */}
          {otherProducts.length > 0 && (
            <div className="mt-6 bg-white">
              <div className="px-4 py-3 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">ALL PRODUCTS</h2>
                  <span className="text-sm text-gray-600">{otherProducts.length} products</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 px-4 py-4">
                {otherProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="mobile" />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Standard All Products Display */
        <div className="mt-6 bg-white">
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">All Products</h2>
              <FilterBottomSheet variant="icon" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 py-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant="mobile" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

