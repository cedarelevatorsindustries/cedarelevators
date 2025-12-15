"use client"

import { useState, useEffect } from "react"
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import LocalizedClientLink from "@/components/ui/localized-client-link"
import { Package } from "lucide-react"
import ApplicationsMobile from "@/modules/home/components/mobile/sections/applications-mobile"
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
  // Mock data for Top Applications converted to Product structure
  const elevatorTypes: Product[] = [
    {
      id: "home-lift",
      title: "Home Elevator Kit",
      handle: "home-elevator-kit",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop",
      description: "Complete residential elevator system",
      metadata: { category: "Residential" },
      variants: [{
        id: "v1",
        title: "Default",
        calculated_price: {
          calculated_amount: 45000000,
          currency_code: "inr"
        }
      }]
    } as unknown as Product,
    {
      id: "passenger-lift",
      title: "Commercial Passenger Lift",
      handle: "commercial-passenger-lift",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
      description: "High-capacity office building elevator",
      metadata: { category: "Commercial" },
      variants: [{
        id: "v2",
        title: "Default",
        calculated_price: {
          calculated_amount: 82000000,
          currency_code: "inr"
        }
      }]
    } as unknown as Product,
    {
      id: "hospital-lift",
      title: "Stretcher Lift System",
      handle: "stretcher-lift-system",
      thumbnail: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=400&fit=crop",
      description: "Medical grade reliable transport",
      metadata: { category: "Healthcare" },
      variants: [{
        id: "v3",
        title: "Default",
        calculated_price: {
          calculated_amount: 125000000,
          currency_code: "inr"
        }
      }]
    } as unknown as Product,
    {
      id: "goods-lift",
      title: "Heavy Duty Goods Lift",
      handle: "heavy-duty-goods-lift",
      thumbnail: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=400&fit=crop",
      description: "Industrial cargo solution",
      metadata: { category: "Industrial" },
      variants: [{
        id: "v4",
        title: "Default",
        calculated_price: {
          calculated_amount: 65000000,
          currency_code: "inr"
        }
      }]
    } as unknown as Product
  ]

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

      {/* 2. Trending Collections - Horizontal Scroll with Product Cards */}
      <div className="bg-white py-6">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Trending Collections</h2>
          <p className="text-xs text-gray-500">Most popular items across categories</p>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {products.slice(0, 6).map((product) => {
            // Inject category into metadata for the badge
            const productWithCategory = {
              ...product,
              metadata: {
                ...product.metadata,
                category: product.categories?.[0]?.name || "Component"
              }
            }

            return (
              <div key={product.id} className="min-w-[200px] w-[200px] flex-shrink-0">
                <ProductCard
                  product={productWithCategory}
                  variant="special"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Shop by Applications - Reused Component */}
      <ApplicationsMobile />

      {/* 4. Top Applications - Horizontal Scroll Elevator Types */}
      <div className="bg-white py-6">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Top Applications</h2>
          <p className="text-xs text-gray-500">Complete elevator systems by type</p>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {elevatorTypes.map((item) => (
            <div key={item.id} className="min-w-[200px] w-[200px] flex-shrink-0">
              <ProductCard
                product={item}
                variant="special"
                badge="top-application"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
