"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"
import { ProductCategory } from "@/lib/types/domain"
import { getCategoryIcon, getCategoryColors } from "./categories-data"
import ProductCard from "@/components/ui/product-card"

interface CategoryContentProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  categoryRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  onClose: () => void
  categories: ProductCategory[]
}

export function CategoryContent({
  scrollContainerRef,
  categoryRefs,
  onScroll,
  onClose,
  categories
}: CategoryContentProps) {
  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto"
      style={{ scrollBehavior: 'smooth' }}
      onScroll={onScroll}
    >
      <div className="p-6 space-y-12">
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category.handle || category.id)
          const colors = getCategoryColors(category.handle || category.id)
          // Use metadata for image if available, or fallback
          const imageSrc = (category.metadata?.image as string) || '/images/image.png'

          return (
            <div
              key={category.id}
              ref={(el) => { categoryRefs.current[category.id] = el }}
              className="category-section"
            >
              {/* Category Header with View All in top right */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <IconComponent size={24} className={colors.color} />
                  <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                </div>
                <LocalizedClientLink
                  href={`/catalog?category=${category.handle}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors flex items-center gap-1"
                  onClick={onClose}
                >
                  View All →
                </LocalizedClientLink>
              </div>

              {/* Category Description */}
              {category.description && (
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              )}

              {/* Category Products - 5 per row */}
              {category.products && category.products.length > 0 ? (
                <div className="grid grid-cols-5 gap-4">
                  {category.products.slice(0, 5).map((product) => (
                    <div key={product.id} className="min-w-0">
                      <ProductCard
                        product={product}
                        variant="mobile"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No products found in this category.</p>
                </div>
              )}

            </div>
          )
        })}

        <div className="h-8"></div>
      </div>
    </div>
  )
}
