"use client"

import { useState, useMemo, useEffect } from "react"
import { Product, ProductCategory } from "@/lib/types/domain"
import ProductCard from "@/components/ui/product-card"
import { Pagination, ResultsHeader, FilterSidebar } from "@/modules/catalog/sections"
import { BannerCarousel } from "@/modules/catalog/components/banner-carousel"
import { HeroLite } from "@/modules/catalog/components/hero-lite"
import type { ViewMode } from "@/modules/catalog/sections"
import { CatalogType, CATALOG_CONFIGS } from "@/types/catalog"
import { filterProductsByType, getProductTag, getRelatedKeywords } from "@/lib/catalog/product-filters"

interface CatalogTemplateProps {
  products: Product[]
  categories: ProductCategory[]
  searchParams?: {
    type?: string
    category?: string
    application?: string
    search?: string
    view?: string
  }
}

type SortOption = "relevance" | "name" | "price-low" | "price-high" | "newest"
const ITEMS_PER_PAGE = 24

export default function CatalogTemplate({
  products: initialProducts,
  categories,
  searchParams = {}
}: CatalogTemplateProps) {
  // Determine catalog type
  const catalogType = (searchParams.type || "browse-all") as CatalogType
  const config = CATALOG_CONFIGS[catalogType] || CATALOG_CONFIGS["browse-all"]

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("relevance")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([])

  // Load recently viewed from localStorage
  useEffect(() => {
    if (catalogType === "recently-viewed") {
      const stored = localStorage.getItem("recentlyViewed")
      if (stored) {
        try {
          setRecentlyViewedIds(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to parse recently viewed", e)
        }
      }
    }
  }, [catalogType])

  // Filter products by type
  const { primary: primaryProducts, fallback: fallbackProducts } = useMemo(() => {
    return filterProductsByType(initialProducts, {
      type: catalogType,
      category: searchParams.category,
      application: searchParams.application,
      search: searchQuery || searchParams.search,
      recentlyViewedIds,
    })
  }, [initialProducts, catalogType, searchParams, searchQuery, recentlyViewedIds])

  // Get related keywords for search
  const relatedKeywords = useMemo(() => {
    if (catalogType === "search" && searchQuery) {
      return getRelatedKeywords(searchQuery, initialProducts)
    }
    return []
  }, [catalogType, searchQuery, initialProducts])

  // Get current category/application for hero
  const currentCategory = useMemo(() => {
    if (catalogType === "category" && searchParams.category) {
      return categories.find(
        (cat) => cat.id === searchParams.category || cat.handle === searchParams.category
      )
    }
    return null
  }, [catalogType, searchParams.category, categories])

  // Categories for sidebar
  const sidebarCategories = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name || "",
      count: initialProducts.filter(p =>
        p.categories?.some((c: ProductCategory) => c.id === cat.id)
      ).length
    }))
  }, [categories, initialProducts])

  // Combine and filter products
  const allDisplayProducts = useMemo(() => {
    const combined = config.fallbackToAll
      ? [...primaryProducts, ...fallbackProducts]
      : primaryProducts

    let filtered = [...combined]

    // Apply sidebar filters
    if (activeFilters.category && activeFilters.category.length > 0) {
      filtered = filtered.filter(product =>
        product.categories?.some(cat =>
          activeFilters.category.includes(cat.handle || cat.id)
        )
      )
    }

    // Sort products
    const sorted = [...filtered]
    switch (sortBy) {
      case "name":
        sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
        break
      case "price-low":
        sorted.sort((a, b) => {
          const priceA = a.price?.amount || a.variants?.[0]?.price || 0
          const priceB = b.price?.amount || b.variants?.[0]?.price || 0
          return priceA - priceB
        })
        break
      case "price-high":
        sorted.sort((a, b) => {
          const priceA = a.price?.amount || a.variants?.[0]?.price || 0
          const priceB = b.price?.amount || b.variants?.[0]?.price || 0
          return priceB - priceA
        })
        break
      case "newest":
        sorted.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
        break
      case "relevance":
      default:
        break
    }

    return sorted
  }, [primaryProducts, fallbackProducts, config.fallbackToAll, activeFilters, sortBy])

  // Pagination
  const totalPages = Math.ceil(allDisplayProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return allDisplayProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [allDisplayProducts, currentPage])

  // Track primary vs fallback sections
  const primaryCount = primaryProducts.length
  const showPrimarySection = config.filterPrimaryProducts && primaryCount > 0
  const showFallbackSection = config.fallbackToAll && fallbackProducts.length > 0

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, activeFilters, catalogType])

  // Handlers
  const handleFilterChange = (filters: Record<string, string[]>) => {
    setActiveFilters(filters)
  }

  const getProductBadge = (product: Product) => {
    if (product.metadata?.badge) {
      return product.metadata.badge as "offer" | "trending" | "top-application" | "verified" | "pending"
    }
    return undefined
  }

  const getGridColumns = () => {
    if (viewMode === "list") return "grid-cols-1"
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-orange-600">Home</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">{config.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Banner Carousel - Only for browse-all */}
        {config.showBanner && <BannerCarousel />}

        {/* Hero Lite - For category and application */}
        {config.showHeroLite && currentCategory && (
          <HeroLite
            type={config.heroLiteType!}
            title={currentCategory.name || ""}
            description={currentCategory.description || undefined}
            subcategories={currentCategory.category_children}
            metadata={currentCategory.metadata || undefined}
          />
        )}

        {/* Search Keywords */}
        {catalogType === "search" && relatedKeywords.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Related searches:</div>
            <div className="flex flex-wrap gap-2">
              {relatedKeywords.map((keyword) => (
                <a
                  key={keyword}
                  href={`/catalog?type=search&search=${encodeURIComponent(keyword)}`}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:border-orange-600 hover:text-orange-600 transition-colors"
                >
                  {keyword}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <FilterSidebar
            onFilterChange={handleFilterChange}
          />

          {/* Right Column - Products */}
          <div className="flex-1">
            {/* Results Header - Hidden on mobile */}
            <div className="hidden md:block">
              <ResultsHeader
                totalProducts={allDisplayProducts.length}
                currentView={viewMode}
                onViewChange={setViewMode}
                onSortChange={(sort) => setSortBy(sort as SortOption)}
                currentPage={currentPage}
              />
            </div>

            {/* Primary Section Header */}
            {showPrimarySection && (
              <div className="mt-6 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{primaryCount} products</p>
              </div>
            )}

            {/* Product Grid */}
            {paginatedProducts.length > 0 ? (
              <>
                <div className={`mt-6 grid ${getGridColumns()}`}>
                  {paginatedProducts.map((product) => {
                    const tag = getProductTag(product, catalogType)
                    return (
                      <div key={product.id} className="relative">
                        <ProductCard
                          product={product}
                          variant="default"
                          badge={getProductBadge(product)}
                        />
                        {tag && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                            {tag}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Fallback Section Divider */}
                {showFallbackSection && showPrimarySection && currentPage === 1 && (
                  <div className="my-12 border-t border-gray-300 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">More Products</h2>
                    <p className="text-gray-600 text-sm">Explore our full catalog</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setActiveFilters({})
                    setSearchQuery("")
                  }}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
