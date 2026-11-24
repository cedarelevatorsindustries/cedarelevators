"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { Package } from "lucide-react"

interface QuickAccessCategoriesSectionProps {
  categories?: ProductCategory[]
}

export default function QuickAccessCategoriesSection({ categories = [] }: QuickAccessCategoriesSectionProps) {
  return (
    <section className="py-6 bg-white px-4">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
          Find the parts you need
        </h2>
      </div>

      <div
        className="overflow-x-auto overflow-y-hidden [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-stretch gap-4 pb-2">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-xs">No categories available</p>
          ) : (
            categories.map((category) => {
              const href = `/catalog?category=${category.handle}`

              return (
                <a
                  key={category.id}
                  href={href}
                  className="flex flex-col gap-2 items-center min-w-[100px] group"
                >
                  <div className="w-20 h-20 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 transition-colors cursor-pointer overflow-hidden shadow-2xs">
                    {category.thumbnail ? (
                      <img
                        src={category.thumbnail}
                        alt={category.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600 uppercase select-none">
                          {category.name?.charAt(0) || "C"}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[#181411] text-xs font-medium leading-normal text-center">
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

