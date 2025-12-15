"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import CategoryCard from "./category-card"

interface CategoryGridProps {
  categories: ProductCategory[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.slice(0, 12).map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  )
}
