"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"
import { ProductCategory } from "@/lib/types/domain"
import { getCategoryIcon, getCategoryColors } from "./categories-data"

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
          const IconComponent = getCategoryIcon(category.handle || category.slug || category.id)
          const colors = getCategoryColors(category.handle || category.slug || category.id)
          const imageSrc = category.thumbnail_image || category.image_url || '/images/image.png'
          
          return (
            <div
              key={category.id}
              ref={(el) => { categoryRefs.current[category.id] = el }}
              className="category-section"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <IconComponent size={24} className={colors.color} />
                  <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                </div>
                <LocalizedClientLink
                  href={`/catalog?category=${category.handle || category.slug}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors"
                  onClick={onClose}
                >
                  View All →
                </LocalizedClientLink>
              </div>

              {/* Category Description */}
              {category.description && (
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              )}

              {/* Category Image/Placeholder */}
              <div className="grid grid-cols-1 gap-4">
                <div className="group block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                      Browse {category.name}
                    </h4>
                    {category.metadata?.product_count && (
                      <p className="text-xs text-gray-500 mt-1">
                        {category.metadata.product_count} products available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        <div style={{ height: '30vh' }}></div>
      </div>
    </div>
  )
}
