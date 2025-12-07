"use client"

import { HttpTypes } from "@medusajs/types"
import { Package } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface CategoryCardProps {
  category: HttpTypes.StoreProductCategory
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-500 transition-all"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
        <Package className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {category.description}
        </p>
      )}
    </LocalizedClientLink>
  )
}
