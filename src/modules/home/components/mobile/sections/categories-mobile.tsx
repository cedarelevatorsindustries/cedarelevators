"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { Package } from "lucide-react"

interface CategoriesMobileProps {
  categories?: ProductCategory[]
}

export default function CategoriesMobile({ categories = [] }: CategoriesMobileProps) {

  return (
    <section className="py-6 bg-white px-4">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
          Shop by Category
        </h2>
      </div>

      <div
        className="overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-stretch gap-3 pb-2">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-xs">No categories available</p>
          ) : (
            categories.map((category) => {
              const thumbnailSrc = category.thumbnail || category.thumbnail_image || '/images/image.png'
              const href = `/catalog?category=${category.handle || category.slug}`

              return (
                <a
                  key={category.id}
                  href={href}
                  className="flex flex-col gap-2 min-w-[120px] max-w-[120px] items-center group"
                >
                  {/* Square thumbnail image - increased size */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group-hover:border-blue-500 transition-all">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
                        <Package className="w-9 h-9 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-[#181411] text-xs font-medium leading-snug text-center line-clamp-2 break-words">
                    {category.name}
                  </p>
                </a>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

