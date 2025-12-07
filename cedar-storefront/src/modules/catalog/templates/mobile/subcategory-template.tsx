"use client"

import { useState, useEffect, type ReactElement } from "react"
import { HttpTypes } from "@medusajs/types"
import { ArrowLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import ProductCard from "@/components/ui/product-card"

// Type guard for metadata values
function getMetadataString(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return ""
}

interface SubcategoryTemplateProps {
  category: HttpTypes.StoreProductCategory
  products: HttpTypes.StoreProduct[]
  allCategories: HttpTypes.StoreProductCategory[]
  onBack?: () => void
}

export default function SubcategoryTemplate({
  category,
  products,
  allCategories,
  onBack
}: SubcategoryTemplateProps): ReactElement {
  const router = useRouter()
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  
  // Get subcategories (either children or siblings, or create virtual subcategories)
  let subcategories: HttpTypes.StoreProductCategory[] = []
  
  if (category.category_children && category.category_children.length > 0) {
    // Use actual children
    subcategories = category.category_children
  } else if (category.parent_category_id) {
    // Use siblings if this is a child category
    subcategories = allCategories.filter(cat => cat.parent_category_id === category.parent_category_id)
  } else {
    // Create "All" subcategory for main categories
    subcategories = [
      {
        ...category,
        name: "All " + category.name,
        id: category.id + "_all"
      } as HttpTypes.StoreProductCategory
    ]
  }

  // Filter products by selected subcategory
  const filteredProducts = selectedSubCategory
    ? selectedSubCategory.includes("_all")
      ? products.filter(p => p.categories?.some(c => c.id === category.id))
      : (() => {
          // Try to filter by subcategory first
          const subcatProducts = products.filter(p => p.categories?.some(c => c.id === selectedSubCategory))
          // If no products found for subcategory, show all products from parent category
          return subcatProducts.length > 0 
            ? subcatProducts 
            : products.filter(p => p.categories?.some(c => c.id === category.id))
        })()
    : products.filter(p => p.categories?.some(c => c.id === category.id))

  // Auto-select first subcategory if available
  useEffect(() => {
    if (subcategories.length > 0 && !selectedSubCategory) {
      setSelectedSubCategory(subcategories[0].id)
    }
  }, [subcategories, selectedSubCategory])

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => onBack ? onBack() : router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900 line-clamp-1">
            {String(category.name || "")}
          </h1>
          <p className="text-xs text-gray-500">
            {filteredProducts.length} products
          </p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Search size={20} />
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Subcategories */}
        <div className="w-24 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="py-2">
            {subcategories.map((subcat) => (
              <button
                key={subcat.id}
                onClick={() => setSelectedSubCategory(subcat.id)}
                className={`w-full px-2 py-3 text-center transition-all ${
                  selectedSubCategory === subcat.id
                    ? "bg-white border-l-2 border-orange-600 text-orange-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  {/* Icon placeholder */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedSubCategory === subcat.id
                      ? "bg-orange-50"
                      : "bg-white"
                  }`}>
                    <span className="text-2xl">
                      {getMetadataString(subcat.metadata?.icon) || "📦"}
                    </span>
                  </div>
                  <span className="text-xs leading-tight line-clamp-2">
                    {String(subcat.name || "")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            {/* Products Grid - 2 Columns */}
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="mobile"
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-3">📦</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  No products found
                </h3>
                <p className="text-sm text-gray-600">
                  Check back soon for new items
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
