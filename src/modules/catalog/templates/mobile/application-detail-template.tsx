"use client"

import { useState, useMemo, type ReactElement } from "react"
import { Product } from "@/lib/types/domain"
import { ArrowLeft, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import ProductCard from "@/components/ui/product-card"
import { Application } from "@/lib/data/applications"
import { FilterSidebar } from "@/modules/catalog/components/mobile/filter-sidebar"

interface ApplicationDetailTemplateProps {
    application: Application
    products: Product[]
    onBack?: () => void
}

export default function ApplicationDetailTemplate({
    application,
    products,
    onBack
}: ApplicationDetailTemplateProps): ReactElement {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    // Extract unique categories from products
    const categoryFilters = useMemo(() => {
        const categoryMap = new Map<string, { id: string; name: string; count: number }>()

        products.forEach(product => {
            product.categories?.forEach(category => {
                if (categoryMap.has(category.id)) {
                    const existing = categoryMap.get(category.id)!
                    existing.count++
                } else {
                    categoryMap.set(category.id, {
                        id: category.id,
                        name: category.name,
                        count: 1
                    })
                }
            })
        })

        return Array.from(categoryMap.values())
    }, [products])

    // Filter products based on search query and category
    const filteredProducts = useMemo(() => {
        let filtered = products

        // Apply category filter
        if (activeCategory) {
            filtered = filtered.filter(product =>
                product.categories?.some(cat => cat.id === activeCategory)
            )
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [products, activeCategory, searchQuery])

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
                        {application.name}
                    </h1>
                    <p className="text-xs text-gray-500">
                        {filteredProducts.length} products
                    </p>
                </div>
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <Search size={20} />
                </button>
            </div>

            {/* Search Bar - Collapsible */}
            {isSearchOpen && (
                <div className="bg-white border-b border-gray-200 px-4 py-3 animate-in slide-in-from-top duration-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-3 pb-24">
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
                            <div className="text-gray-400 text-5xl mb-3">
                                {searchQuery || activeCategory ? "🔍" : "📦"}
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                {searchQuery || activeCategory ? "No products found" : "No products available"}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {searchQuery
                                    ? `No products match "${searchQuery}"`
                                    : activeCategory
                                        ? "No products in this category"
                                        : `Check back soon for new items in ${application.name}`
                                }
                            </p>
                            {(searchQuery || activeCategory) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("")
                                        setActiveCategory(null)
                                    }}
                                    className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Sidebar - Only show if categories are available */}
            {categoryFilters.length > 0 && (
                <FilterSidebar
                    title="Categories"
                    filters={categoryFilters}
                    activeFilter={activeCategory}
                    onFilterChange={setActiveCategory}
                />
            )}
        </div>
    )
}
