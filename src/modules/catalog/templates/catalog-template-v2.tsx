"use client"

import { useState, useMemo, useEffect } from "react"
import { Product, ProductCategory } from "@/lib/types/domain"
import ProductCard from "@/components/ui/product-card"
import { Pagination, ResultsHeader } from "@/modules/catalog/sections"
import { ProductFilterSidebar } from "@/modules/catalog/components/filters/ProductFilterSidebar"
import { ProductFilterModal } from "@/modules/catalog/components/filters/ProductFilterModal"
import { ActiveFilterChips } from "@/modules/catalog/components/filters/ActiveFilterChips"
import { BannerCarousel } from "@/modules/catalog/components/banner-carousel"
import { CatalogBanner } from "@/modules/catalog/components/catalog-banner"
import type { ViewMode } from "@/modules/catalog/sections"
import { CatalogType, CATALOG_CONFIGS } from "@/types/catalog"
import { getApplicationConfig, getCategoriesForApplication } from "@/lib/config/applications"
import { BannerWithSlides } from "@/lib/types/banners"
import { FilterParams } from "@/lib/services/filterService"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

interface CatalogTemplateV2Props {
  categories: ProductCategory[]
  activeCategory?: ProductCategory
  banners?: BannerWithSlides[]
  searchParams?: {
    type?: string
    category?: string
    application?: string
    search?: string
    view?: string
  }
}

type SortOption = "relevance" | "name" | "price-low" | "price-high" | "newest" | "rating" | "featured"
const ITEMS_PER_PAGE = 24

export default function CatalogTemplateV2({
  categories,
  activeCategory,
  banners = [],
  searchParams = {}
}: CatalogTemplateV2Props) {
  // Determine catalog type
  let resolvedType = searchParams.type
  if (!resolvedType) {
    if (searchParams.category) resolvedType = "category"
    else if (searchParams.application) resolvedType = "application"
    else if (searchParams.search) resolvedType = "search"
    else resolvedType = "browse-all"
  }
  const catalogType = resolvedType as CatalogType
  const config = CATALOG_CONFIGS[catalogType] || CATALOG_CONFIGS["browse-all"]

  // State
  const urlSearchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("featured")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterParams>({})

  // Get application config
  const applicationData = useMemo(() => {
    if (searchParams.application) {
      const appConfig = getApplicationConfig(searchParams.application)
      if (appConfig) {
        const appCategories = getCategoriesForApplication(searchParams.application, categories)
        return { config: appConfig, categories: appCategories }
      }
    }
    return null
  }, [searchParams.application, categories])

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [urlSearchParams, currentPage, sortBy])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams(urlSearchParams.toString())
      params.set('page', String(currentPage))
      params.set('limit', String(ITEMS_PER_PAGE))
      params.set('sort', sortBy)
      params.set('include_facets', 'false') // Facets are fetched separately by filter components

      const response = await fetch(`/api/store/products?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products || [])
        setTotalCount(data.data.total || 0)
      } else {
        console.error('Failed to fetch products:', data.error)
        setProducts([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const getProductBadge = (product: Product) => {
    if (product.metadata?.badge) {
      return product.metadata.badge as "offer" | "trending" | "top-application" | "verified" | "pending"
    }
    return undefined
  }

  const getGridColumns = () => {
    if (viewMode === "list") return "grid-cols-1"
    if (config.showFilters) {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    }
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
  }

  // Get active filter chips for display
  const getActiveFilterChips = () => {
    const chips: { key: string; label: string; value: any }[] = []
    
    if (filters.category && Array.isArray(filters.category)) {
      filters.category.forEach(cat => {
        chips.push({ key: 'category', label: `Category: ${cat}`, value: cat })
      })
    }
    
    if (filters.price_min || filters.price_max) {
      const min = filters.price_min || 0
      const max = filters.price_max || '∞'
      chips.push({ key: 'price', label: `₹${min} - ₹${max}`, value: null })
    }
    
    if (filters.in_stock) {
      chips.push({ key: 'stock', label: 'In Stock', value: null })
    }
    
    if (filters.voltage && Array.isArray(filters.voltage)) {
      filters.voltage.forEach(v => {
        chips.push({ key: 'voltage', label: v, value: v })
      })
    }
    
    if (filters.rating_min) {
      chips.push({ key: 'rating', label: `${filters.rating_min}+ Stars`, value: null })
    }
    
    return chips
  }

  const handleRemoveFilter = (key: string, value?: any) => {
    // This will be handled by the filter components
  }

  const handleClearAllFilters = () => {
    // This will be handled by the filter components
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Application Banner */}
      {config.showBanner && applicationData && (
        <CatalogBanner
          title={applicationData.config.name}
          subtitle={applicationData.config.subtitle}
          backgroundImage={applicationData.config.backgroundImage}
          categories={applicationData.categories}
          type="application"
          slug={applicationData.config.slug}
          variant={config.bannerVariant || "full"}
        />
      )}

      {/* Category Banner */}
      {config.showBanner && !applicationData && activeCategory && (
        <CatalogBanner
          title={activeCategory.name || ""}
          subtitle={activeCategory.description || undefined}
          backgroundImage={(activeCategory.metadata?.banner as string) || "/images/image.png"}
          categories={activeCategory.category_children || []}
          type="category"
          slug={activeCategory.handle || activeCategory.id}
          variant={config.bannerVariant || "full"}
        />
      )}

      {/* Browse All Banner */}
      {config.showBanner && !applicationData && !activeCategory && catalogType === "browse-all" && (
        banners.length > 0 ? (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-[70px]">
            <BannerCarousel banners={banners} />
          </div>
        ) : (
          <CatalogBanner
            title="Premium Elevator Components"
            subtitle="ISO Certified Quality | Pan-India Delivery"
            backgroundImage="/images/image.png"
            categories={categories.slice(0, 10)}
            type="category"
            slug="all"
            variant={config.bannerVariant || "simple"}
          />
        )
      )}

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>{totalCount} products found</span>
            )}
          </div>
          <ProductFilterModal onFilterChange={handleFilterChange} />
        </div>

        {/* Desktop Layout with Sidebar */}
        {config.showFilters ? (
          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block">
              <ProductFilterSidebar onFilterChange={handleFilterChange} />
            </div>

            {/* Products Column */}
            <div className="flex-1 min-w-0">
              {/* Results Header with Sort */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {config.title || "All Products"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {isLoading ? "Loading..." : `${totalCount} products`}
                  </p>
                </div>
                <div className="hidden lg:block">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {getActiveFilterChips().length > 0 && (
                <div className="mb-6">
                  <ActiveFilterChips
                    filters={getActiveFilterChips()}
                    onRemove={handleRemoveFilter}
                    onClearAll={handleClearAllFilters}
                  />
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              )}

              {/* Product Grid */}
              {!isLoading && products.length > 0 && (
                <>
                  <div className={`grid ${getGridColumns()}`}>
                    {products.map((product) => (
                      <div key={product.id} className="relative">
                        <ProductCard
                          product={product}
                          variant="default"
                          badge={getProductBadge(product)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              )}

              {/* Empty State */}
              {!isLoading && products.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Full Width Layout without Filters */
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {config.title || "All Products"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isLoading ? "Loading..." : `${totalCount} products`}
              </p>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            )}

            {!isLoading && products.length > 0 && (
              <>
                <div className={`grid ${getGridColumns()}`}>
                  {products.map((product) => (
                    <div key={product.id} className="relative">
                      <ProductCard
                        product={product}
                        variant="default"
                        badge={getProductBadge(product)}
                      />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}

            {!isLoading && products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
