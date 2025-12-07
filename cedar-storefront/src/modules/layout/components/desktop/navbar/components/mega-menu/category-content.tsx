"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"
import { elevatorCategories, getProductsForCategory } from "./categories-data"

interface CategoryContentProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  categoryRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  onClose: () => void
}

export function CategoryContent({
  scrollContainerRef,
  categoryRefs,
  onScroll,
  onClose
}: CategoryContentProps) {
  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto"
      style={{ scrollBehavior: 'smooth' }}
      onScroll={onScroll}
    >
      <div className="p-6 space-y-12">
        {elevatorCategories.map((category) => {
          const IconComponent = category.icon
          const products = getProductsForCategory(category.id)
          
          return (
            <div
              key={category.id}
              ref={(el) => { categoryRefs.current[category.id] = el }}
              className="category-section"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <IconComponent size={24} className={category.color} />
                  <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                </div>
                <LocalizedClientLink
                  href={`/categories/${category.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors"
                  onClick={onClose}
                >
                  View All →
                </LocalizedClientLink>
              </div>

              {/* Products Grid - 4 columns */}
              <div className="grid grid-cols-4 gap-4">
                {products.map((product) => (
                  <LocalizedClientLink
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                    onClick={onClose}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-center line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h4>
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          )
        })}
        
        <div style={{ height: '30vh' }}></div>
      </div>
    </div>
  )
}
