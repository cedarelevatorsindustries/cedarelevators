"use client"

import { useState, useEffect } from "react"
import { Product, ProductCategory } from "@/lib/types/domain"
import type { ElevatorType } from "@/lib/data/elevator-types"
import { Package } from "lucide-react"
import ElevatorTypesMobile from "@/modules/home/components/mobile/sections/elevator-types-mobile"
import QuickCommerceSubcategoryTemplate from "./subcategory-template"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"

interface CategoriesTabProps {
  categories: ProductCategory[]
  products: Product[]
  elevatorTypes?: ElevatorType[]
  collections?: any[]
}

export default function CategoriesTabTemplate({ categories, products, elevatorTypes = [], collections = [] }: CategoriesTabProps) {
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
        collections={collections}
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
          {categories.slice(0, 9).map((category) => {
            const thumbnailSrc = category.thumbnail || category.thumbnail_image || category.image_url

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-full aspect-square bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center group-hover:border-orange-500 group-hover:bg-orange-50 transition-all overflow-hidden">
                  {thumbnailSrc ? (
                    <img
                      src={thumbnailSrc}
                      alt={category.name || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2 group-hover:text-orange-700">
                  {category.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Category-Specific Collections - From database */}
      {collections.map((dbCollection) => {
        // Transform to match desktop pattern
        const transformedCollection = {
          id: dbCollection.id,
          title: dbCollection.title,
          description: dbCollection.description,
          slug: dbCollection.slug,
          displayLocation: [],
          layout: 'grid-4',
          icon: 'trending',
          viewAllLink: `/catalog?collection=${dbCollection.slug}`,
          products: (dbCollection.products || []).map((pc: any) => {
            // Handle both formats: pc.product (nested) or pc (direct)
            const product = pc.product || pc
            return {
              id: product.id,
              title: product.name || product.title,
              name: product.name || product.title,
              slug: product.slug,
              handle: product.slug,
              thumbnail: product.thumbnail_url || product.thumbnail,
              price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
              compare_at_price: product.compare_at_price,
              // Include variants from product_variants for stock display
              variants: product.product_variants || []
            }
          }),
          isActive: dbCollection.is_active,
          sortOrder: dbCollection.sort_order,
          showViewAll: true
        }

        return (
          <DynamicCollectionSection
            key={dbCollection.id}
            collection={transformedCollection}
            variant="mobile"
          />
        )
      })}

      {/* 3. Shop by Elevator Type - Desktop-style cards */}
      {elevatorTypes.length > 0 && (
        <div className="bg-white py-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Shop by Elevator Type</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {elevatorTypes.map((type) => (
              <div key={type.id} className="flex flex-col">
                {/* Card with Image */}
                <a
                  href={`/catalog?elevator_type=${type.slug}`}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 aspect-square mb-3"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-gray-200">
                    {type.thumbnail_image ? (
                      <img
                        src={type.thumbnail_image}
                        alt={type.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100" />
                    )}

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
                  </div>
                </a>

                {/* Title and Description Below Image */}
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {type.title}
                  </h3>
                  {type.description && (
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-3">
                      {type.description}
                    </p>
                  )}
                </div>

                {/* Blue Shop Now Button */}
                <a
                  href={`/catalog?elevator_type=${type.slug}`}
                  className="w-full text-center text-white font-semibold text-sm bg-blue-600 hover:bg-blue-700 rounded-lg py-2.5 transition-colors"
                >
                  Shop Now
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
