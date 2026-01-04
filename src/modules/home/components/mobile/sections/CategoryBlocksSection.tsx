"use client"

import { ArrowRight } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { ProductCategory } from "@/lib/types/domain"

interface CategoryBlocksSectionProps {
  categories: ProductCategory[]
}

export default function CategoryBlocksSection({ categories }: CategoryBlocksSectionProps) {
  // Take first 4 categories for mobile display
  const displayCategories = categories.slice(0, 4)

  if (displayCategories.length === 0) {
    return null
  }

  return (
    <div className="px-4 pt-8 bg-white">
      <div className="grid grid-cols-2 gap-4">
        {displayCategories.map((category) => (
          <LocalizedClientLink
            key={category.id}
            href={`/catalog?category=${category.handle}`}
            className="relative flex h-32 flex-col justify-end overflow-hidden rounded-lg p-3 text-white group"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: category.thumbnail
                  ? `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 100%), url('${category.thumbnail}')`
                  : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
              }}
            />
            <div className="relative z-10">
              <h4 className="font-bold text-sm uppercase">{category.name}</h4>
            </div>
            <ArrowRight className="absolute right-3 top-3 z-10 text-white/70 group-hover:text-white transition-colors" size={16} />
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
