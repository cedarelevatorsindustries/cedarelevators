"use client"

import { useState, useEffect, type ReactElement } from "react"
import { Product, ProductCategory } from "@/lib/types/domain"
import { ArrowLeft, Search, Package2 } from "lucide-react"
import { useRouter } from "next/navigation"
import ProductCard from "@/components/ui/product-card"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterBottomSheet } from "@/modules/catalog/components/filters"

interface SubcategoryTemplateProps {
  category: ProductCategory
  products: Product[]
  allCategories: ProductCategory[]
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
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  // Get subcategories (either children or siblings, or create virtual subcategories)
  let subcategories: ProductCategory[] = []

  if (category.category_children && category.category_children.length > 0) {
    // Use actual children
    subcategories = category.category_children
  } else if (category.parent_id) {
    // Use siblings if this is a child category
    subcategories = allCategories.filter(cat => cat.parent_id === category.parent_id)
  } else {
    // Create "All" subcategory for main categories
    subcategories = [
      {
        ...category,
        name: "All",
        id: category.id + "_all"
      } as ProductCategory
    ]
  }

  // Filter products by selected subcategory and search query
  const filteredProducts = (() => {
    let filtered = products // Start with all products (already filtered by backend if from application)

    // Only apply category filtering if we have actual subcategories
    if (category.category_children && category.category_children.length > 0) {
      if (selectedSubCategory) {
        if (selectedSubCategory.includes("_all")) {
          filtered = products.filter(p => p.categories?.some(c => c.id === category.id))
        } else {
          const subcatProducts = products.filter(p => p.categories?.some(c => c.id === selectedSubCategory))
          filtered = subcatProducts.length > 0
            ? subcatProducts
            : products.filter(p => p.categories?.some(c => c.id === category.id))
        }
      } else {
        filtered = products.filter(p => p.categories?.some(c => c.id === category.id))
      }
    }
    // If no subcategories (like for applications), use all products as-is

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    return filtered
  })()

  // Auto-select first subcategory if available
  useEffect(() => {
    if (subcategories.length > 0 && !selectedSubCategory) {
      setSelectedSubCategory(subcategories[0].id)
    }
  }, [subcategories, selectedSubCategory])

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Main Content - No top padding */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Subcategories */}
        <div className="w-20 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
          {/* Back Button at Top */}
          <div className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
            <button
              onClick={() => onBack ? onBack() : router.back()}
              className="w-full p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Subcategory List */}
          <div className="py-2">
            {subcategories.map((subcat) => {
              const thumbnailSrc = subcat.thumbnail || subcat.thumbnail_image || subcat.image_url

              return (
                <button
                  key={subcat.id}
                  onClick={() => setSelectedSubCategory(subcat.id)}
                  className={`w-full px-2 py-3 text-center transition-all ${selectedSubCategory === subcat.id
                    ? "bg-white border-l-3 border-orange-600"
                    : "hover:bg-gray-100"
                    }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    {/* Image/Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${selectedSubCategory === subcat.id
                      ? "bg-orange-50 ring-2 ring-orange-600"
                      : "bg-white border border-gray-200"
                      }`}>
                      {thumbnailSrc ? (
                        <img
                          src={thumbnailSrc}
                          alt={subcat.name || ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package2 className={`w-6 h-6 ${selectedSubCategory === subcat.id ? "text-orange-600" : "text-gray-400"}`} />
                      )}
                    </div>
                    <span className={`text-[10px] leading-tight line-clamp-2 ${selectedSubCategory === subcat.id
                      ? "text-orange-600 font-semibold"
                      : "text-gray-700"
                      }`}>
                      {String(subcat.name || "")}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Content - Products Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header with Category Name and Search */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 line-clamp-1">
                {String(category.name || "")}
              </h1>
              <p className="text-xs text-gray-500">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FilterBottomSheet variant="icon" />
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar (conditional) */}
          {showSearch && (
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          )}

          {/* Horizontal Filter Pills (Subcategories) */}
          {subcategories.length > 1 && (
            <div className="px-4 py-3 border-b border-gray-100 bg-white overflow-x-auto scrollbar-hide">
              <div className="flex gap-2">
                {subcategories.map((subcat) => (
                  <button
                    key={subcat.id}
                    onClick={() => setSelectedSubCategory(subcat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${selectedSubCategory === subcat.id
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {String(subcat.name || "")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="mobile"
                    />
                  ))}
                </div>
              ) : (
                /* Empty State - Same as Desktop */
                <EmptyState
                  image="/empty-states/no-result-found.png"
                  title="No products found"
                  description={searchQuery
                    ? `No products match "${searchQuery}". Try a different search term.`
                    : "There are no products in this category yet. Check back soon!"}
                  actionLabel={searchQuery ? "Clear Search" : "Browse All Products"}
                  onAction={searchQuery ? () => setSearchQuery("") : () => router.push('/')}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </div>
  )
}
