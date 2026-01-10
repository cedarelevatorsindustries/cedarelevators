"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Product, ProductCategory } from "@/lib/types/domain"
import ProductCard from "@/components/ui/product-card"
import { Pagination, ResultsHeader } from "@/modules/catalog/sections"
import { UnifiedFilterSidebar, FilterBottomSheet } from "@/modules/catalog/components/filters"
import { BannerCarousel } from "@/modules/catalog/components/banner-carousel"
import { HeroLite } from "@/modules/catalog/components/hero-lite"
import { CatalogBanner } from "@/modules/catalog/components/catalog-banner"
import { HorizontalFilterBar } from "@/modules/catalog/components/desktop/horizontal-filter-bar"
import type { ViewMode } from "@/modules/catalog/sections"
import { CatalogType, CATALOG_CONFIGS } from "@/types/catalog"
import { filterProductsByType, getProductTag, getRelatedKeywords } from "@/lib/catalog/product-filters"
import { BannerWithSlides } from "@/lib/types/banners"
import { EmptyState } from "@/components/ui/empty-state"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"

interface CatalogTemplateProps {
  products: Product[]
  categories: ProductCategory[]
  activeCategory?: ProductCategory & {
    category_children?: any[]
  }
  activeApplication?: any & {
    categories?: any[]
  }
  activeType?: any
  activeCollection?: any
  collections?: any[]
  banners?: BannerWithSlides[]
  searchParams?: {
    type?: string
    category?: string
    application?: string
    search?: string
    view?: string
  }
  tab?: string
  app?: string
}

type SortOption = "relevance" | "name" | "price-low" | "price-high" | "newest"
const ITEMS_PER_PAGE = 24

export default function CatalogTemplate({
  products: initialProducts,
  categories,
  activeCategory,
  activeApplication,
  collections = [],
  banners = [],
  searchParams = {},
  app
}: CatalogTemplateProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()

  // Merge app prop into searchParams for consistent handling
  const effectiveSearchParams = {
    ...searchParams,
    application: searchParams.application || app
  }

  // Determine catalog type
  let resolvedType = effectiveSearchParams.type
  if (!resolvedType) {
    if (effectiveSearchParams.category) resolvedType = "category"
    else if (effectiveSearchParams.application) resolvedType = "application"
    else if (effectiveSearchParams.search) resolvedType = "search"
    else resolvedType = "browse-all"
  }
  const catalogType = resolvedType as CatalogType
  const config = CATALOG_CONFIGS[catalogType] || CATALOG_CONFIGS["browse-all"]

  // State
  const [searchQuery, setSearchQuery] = useState(effectiveSearchParams.search || "")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("relevance")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([])

  // Horizontal filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    urlSearchParams?.get('category') || effectiveSearchParams.category || null
  )
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    urlSearchParams?.get('subcategory') || null
  )

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

  // Sync state with URL params
  useEffect(() => {
    const categoryParam = urlSearchParams?.get('category')
    const subcategoryParam = urlSearchParams?.get('subcategory')

    // Only update if changed to avoid unnecessary re-renders
    if (categoryParam !== selectedCategory && (categoryParam || effectiveSearchParams.category)) {
      setSelectedCategory(categoryParam || effectiveSearchParams.category || null)
    }

    if (subcategoryParam !== selectedSubcategory) {
      setSelectedSubcategory(subcategoryParam || null)
    }
  }, [urlSearchParams, effectiveSearchParams.category])

  // Filter products by type
  const { primary: primaryProducts, fallback: fallbackProducts } = useMemo(() => {
    return filterProductsByType(initialProducts, {
      type: catalogType,
      category: effectiveSearchParams.category,
      application: effectiveSearchParams.application,
      search: searchQuery || effectiveSearchParams.search,
      recentlyViewedIds,
    })
  }, [initialProducts, catalogType, effectiveSearchParams, searchQuery, recentlyViewedIds])

  // Get related keywords for search
  const relatedKeywords = useMemo(() => {
    if (catalogType === "search" && searchQuery) {
      return getRelatedKeywords(searchQuery, initialProducts)
    }
    return []
  }, [catalogType, searchQuery, initialProducts])

  // Get current category/application for hero
  const currentCategory = useMemo(() => {
    // Priority: use explicit activeCategory pass from server
    if (activeCategory) return activeCategory

    // Fallback: looked up from categories list (only works for top level)
    if (catalogType === "category" && effectiveSearchParams.category) {
      return categories.find(
        (cat) => cat.id === effectiveSearchParams.category || cat.handle === effectiveSearchParams.category
      )
    }
    return null
  }, [catalogType, effectiveSearchParams.category, categories, activeCategory])

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

    // Apply horizontal filter bar filters (check both id and slug/handle)
    // Skip filtering if the selected category is the same as the page's main category
    // (backend already filtered for main category)
    const isMainCategory = selectedCategory && (
      selectedCategory === effectiveSearchParams.category ||
      (currentCategory && (
        selectedCategory === currentCategory.id ||
        selectedCategory === currentCategory.handle ||
        selectedCategory === currentCategory.slug
      ))
    )

    if (selectedCategory && !isMainCategory) {
      filtered = filtered.filter(product =>
        product.categories?.some((cat: any) =>
          cat.id === selectedCategory ||
          cat.handle === selectedCategory ||
          cat.slug === selectedCategory
        )
      )
    } else if (selectedSubcategory) {
      filtered = filtered.filter(product =>
        product.categories?.some((cat: any) =>
          cat.id === selectedSubcategory ||
          cat.handle === selectedSubcategory ||
          cat.slug === selectedSubcategory
        )
      )
    }

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
  }, [primaryProducts, fallbackProducts, config.fallbackToAll, activeFilters, sortBy, selectedCategory, selectedSubcategory])

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
    // 4 columns when filters are shown, 5 columns when filters are hidden
    if (config.showFilters) {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    }
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[70px]">

      {/* Application Banner - Full Width */}
      {config.showBanner && activeApplication && (
        <CatalogBanner
          title={activeApplication.name}
          subtitle={activeApplication.description || activeApplication.subtitle}
          backgroundImage={activeApplication.banner_image || activeApplication.image_url || "/images/image.png"}
          categories={activeApplication.categories || []}
          type="application"
          slug={activeApplication.slug}
          variant={config.bannerVariant || "full"}
        />
      )}

      {/* Category Banner - Full Width */}
      {config.showBanner && !activeApplication && currentCategory && (
        <CatalogBanner
          title={currentCategory.name || ""}
          subtitle={currentCategory.description || undefined}
          backgroundImage={currentCategory.banner_url || currentCategory.thumbnail || "/images/image.png"}
          categories={currentCategory.category_children || []}
          type="category"
          slug={currentCategory.handle || currentCategory.id}
          variant={config.bannerVariant || "full"}
        />
      )}

      {/* Browse All Banner - Full Width (Only for browse-all type and when banners exist) */}
      {config.showBanner && !activeApplication && !currentCategory && catalogType === "browse-all" && banners.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-8 pt-8 mt-[70px]">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* Category Specific Collections */}
      {catalogType === "category" && collections.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-8 pt-8">
          {collections.map((collection) => (
            /* Transform collection products if needed or assume page.tsx does it */
            <DynamicCollectionSection
              key={collection.id}
              collection={{
                ...collection,
                products: collection.products.map((p: any) => ({
                  ...p,
                  price: p.price ? { amount: p.price, currency_code: 'INR' } : undefined
                }))
              }}
            />
          ))}
        </div>
      )}


      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
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

        {/* Conditional Layout Based on showFilters */}
        {config.showFilters ? (
          /* Two-Column Layout with Filters */
          <div className="flex gap-8">
            {/* Filter Sidebar */}
            <UnifiedFilterSidebar />

            {/* Products Column */}
            <div className="flex-1">
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
                <EmptyState
                  image="/empty-states/no-result-found.png"
                  title="No results found."
                  description="We couldn't find any elevator components matching your search. Try different keywords or browse all parts."
                  actionLabel="Clear Search & Browse All"
                  onAction={() => {
                    setActiveFilters({})
                    setSearchQuery("")
                    // Also clear URL params by pushing to base catalog URL
                    router.push('/catalog')
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          /* Full Width Layout without Filters */
          <div className="w-full">

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
              <EmptyState
                image="/empty-states/no-result-found.png"
                title="No products found"
                description="Try adjusting your search or filter criteria"
                actionLabel="Clear All Filters"
                onAction={() => {
                  setActiveFilters({})
                  setSearchQuery("")
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

