"use client"

import { useState, useEffect } from "react"
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import LocalizedClientLink from "@/components/ui/localized-client-link"
import { Package } from "lucide-react"
import ElevatorTypesMobile from "@/modules/home/components/mobile/sections/elevator-types-mobile"
import ProductCard from "@/components/ui/product-card"
import QuickCommerceSubcategoryTemplate from "./subcategory-template"

interface CategoriesTabProps {
  categories: ProductCategory[]
  products: Product[]
}

export default function CategoriesTabTemplate({ categories, products }: CategoriesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (selectedCategory) {
        setSelectedCategory(null)
      }
    }

    // Push state when category is selected
    if (selectedCategory) {
      window.history.pushState({ categoryView: true }, '')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedCategory])

  // If a category is selected, show quick commerce layout
  if (selectedCategory) {
    return (
      <QuickCommerceSubcategoryTemplate
        category={selectedCategory}
        products={products}
        allCategories={categories}
        onBack={() => setSelectedCategory(null)}
      />
    )
  }


  return (
    <div className="pb-24 bg-gray-50 space-y-6">
      {/* 1. Shop by Categories - 3 Column Grid */}
      <div className="bg-white py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Shop by Categories</h2>
          <button
            onClick={() => {
              // Show first category as default when viewing all
              if (categories.length > 0) {
                setSelectedCategory(categories[0])
              }
            }}
            className="text-xs font-bold text-blue-600"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.slice(0, 9).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-full aspect-square bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-all">
                <Package className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2 group-hover:text-blue-700">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Shop by Elevator Type - Reused Component */}
      <ElevatorTypesMobile elevatorTypes={[]} />

    </div>
  )
}

