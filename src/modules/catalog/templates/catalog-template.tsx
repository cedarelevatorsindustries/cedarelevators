"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Product, ProductCategory } from "@/lib/types/domain"
import ProductCard from "@/components/ui/product-card"
import { Pagination, SortControls, type SortOption } from "@/modules/catalog/sections"
import { UnifiedFilterSidebar, ActiveFilterChips } from "@/modules/catalog/components/filters"
import { BannerCarousel } from "@/modules/catalog/components/banner-carousel"
import { HeroLite } from "@/modules/catalog/components/hero-lite"
import { CatalogBanner } from "@/modules/catalog/components/catalog-banner"
import { HorizontalFilterBar } from "@/modules/catalog/components/desktop/horizontal-filter-bar"
import type { ViewMode } from "@/modules/catalog/sections"
import { CatalogType, CATALOG_CONFIGS } from "@/types/catalog"
import { filterProductsByType, getProductTag, getRelatedKeywords } from "@/lib/catalog/product-filters"
import {
  parseCatalogFiltersFromURL,
  buildCatalogFilterSearchParams,
  applyCatalogFilters,
  type CatalogSortOption,
} from "@/lib/catalog/filter-utils"
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

const ITEMS_PER_PAGE = 24

const CATALOG_SORT_OPTIONS: SortOption[] = [
  { id: "featured", label: "Featured" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "name_asc", label: "Name: A to Z" },
  { id: "name_desc", label: "Name: Z to A" },
  { id: "newest", label: "Newest First" },
]

export default function CatalogTemplate({
  products: initialProducts,
  categories,
  activeCategory,
  activeApplication,
  activeType,
  activeCollection,
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
    else if (activeCollection) resolvedType = "collection"
    else if (effectiveSearchParams.search) resolvedType = "search"
    else resolvedType = "browse-all"
  }
  const catalogType = resolvedType as CatalogType
  // Create a copy of the config to allow overrides
  let config = { ...(CATALOG_CONFIGS[catalogType] || CATALOG_CONFIGS["browse-all"]) }

  // Override config for elevator types
  if (activeType) {
    config.showFilters = false
    config.title = activeType.title || config.title
    config.showBanner = true
  }

  // State
  const [searchQuery, setSearchQuery] = useState(effectiveSearchParams.search || "")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
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
    // Extract collection product IDs if this is a collection catalog
    const collectionProductIds = activeCollection?.products?.map((p: any) => {
      // Handle both direct product_id and nested product.id
      if (typeof p === 'object') {
        return p.product_id || p.product?.id || p.id
      }
      return p
    }).filter(Boolean) || []



    return filterProductsByType(initialProducts, {
      type: catalogType,
      category: effectiveSearchParams.category,
      application: effectiveSearchParams.application,
      collection: activeCollection?.slug || activeCollection?.handle,
      collectionProductIds,
      search: searchQuery || effectiveSearchParams.search,
      recentlyViewedIds,
    })
  }, [initialProducts, catalogType, effectiveSearchParams, searchQuery, recentlyViewedIds, activeCollection])

  // Get related keywords for search
  const relatedKeywords = useMemo(() => {
    if (catalogType === "search" && searchQuery) {
      return getRelatedKeywords(searchQuery, initialProducts)
    }
    return []
  }, [catalogType, searchQuery, initialProducts])

  // Combine products for filters (before sidebar filters)
  const productsForFilters = useMemo(() => {
    return config.fallbackToAll
      ? [...primaryProducts, ...fallbackProducts]
      : primaryProducts
  }, [primaryProducts, fallbackProducts, config.fallbackToAll])

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

  // Parse all URL-driven filters (availability, option_*, categories, subcategories, applications, sort, q)
  const urlFilters = useMemo(
    () => parseCatalogFiltersFromURL(urlSearchParams),
    [urlSearchParams]
  )

  // Combine and filter products using unified filtering + sorting
  const allDisplayProducts = useMemo(() => {
    const combined = config.fallbackToAll
      ? [...primaryProducts, ...fallbackProducts]
      : primaryProducts

    let filtered = [...combined]

    // Apply horizontal filter bar filters (check both id and slug/handle)
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
    } else if (selectedSubcategory && catalogType !== 'category') {
      filtered = filtered.filter(product =>
        product.categories?.some((cat: any) =>
          cat.id === selectedSubcategory ||
          cat.handle === selectedSubcategory ||
          cat.slug === selectedSubcategory
        )
      )
    }

    // Apply unified URL filters (availability, variant options, categories, subcategories, applications, sort)
    // Skip re-filtering by `q` here when catalogType === 'search' because server RPC search_products already ranked & filtered it
    filtered = applyCatalogFilters(filtered, {
      ...urlFilters,
      q: catalogType === 'search' ? '' : urlFilters.q,
    })

    return filtered
  }, [primaryProducts, fallbackProducts, config.fallbackToAll, urlFilters, selectedCategory, selectedSubcategory, catalogType, effectiveSearchParams.category, currentCategory])

  // Build active filter chips for display & individual removal
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; value: any }> = []
    if (urlFilters.availability === "in_stock") {
      chips.push({ key: "availability", label: "In Stock", value: "in_stock" })
    } else if (urlFilters.availability === "out_of_stock") {
      chips.push({ key: "availability", label: "Out of Stock", value: "out_of_stock" })
    }
    Object.entries(urlFilters.options).forEach(([optName, vals]) => {
      vals.forEach((v) => {
        chips.push({ key: `option_${optName}`, label: `${optName}: ${v}`, value: v })
      })
    })
    urlFilters.applications.forEach((id) => {
      const match = activeApplication?.categories?.find((c: any) => c.id === id)
      chips.push({ key: "applications", label: match?.name || id, value: id })
    })
    urlFilters.categories.forEach((id) => {
      const match = categories.find((c) => c.id === id || c.handle === id)
      chips.push({ key: "categories", label: match?.name || id, value: id })
    })
    urlFilters.subcategories.forEach((id) => {
      const match = categories.find((c) => c.id === id || c.handle === id)
      chips.push({ key: "subcategories", label: match?.name || id, value: id })
    })
    return chips
  }, [urlFilters, categories, activeApplication])

  const handleSortChange = (sortId: string) => {
    const params = buildCatalogFilterSearchParams(urlSearchParams, {
      sort: sortId as CatalogSortOption,
    })
    const queryStr = params.toString()
    router.push(queryStr ? `/products?${queryStr}` : "/products", { scroll: false })
  }

  const handleRemoveChip = (key: string, value?: any) => {
    if (key === "availability") {
      const params = buildCatalogFilterSearchParams(urlSearchParams, { availability: "all" })
      const q = params.toString()
      router.push(q ? `/products?${q}` : "/products", { scroll: false })
      return
    }
    if (key.startsWith("option_")) {
      const optName = key.slice("option_".length)
      const nextOpts = { ...urlFilters.options }
      nextOpts[optName] = (nextOpts[optName] || []).filter((v) => v !== value)
      if (nextOpts[optName].length === 0) delete nextOpts[optName]
      const params = buildCatalogFilterSearchParams(urlSearchParams, { options: nextOpts })
      const q = params.toString()
      router.push(q ? `/products?${q}` : "/products", { scroll: false })
      return
    }
    if (key === "categories" || key === "subcategories" || key === "applications") {
      const nextArr = urlFilters[key].filter((v) => v !== value)
      const params = buildCatalogFilterSearchParams(urlSearchParams, { [key]: nextArr })
      const q = params.toString()
      router.push(q ? `/products?${q}` : "/products", { scroll: false })
    }
  }

  const handleClearAllFilters = () => {
    setActiveFilters({})
    setSearchQuery("")
    const params = buildCatalogFilterSearchParams(urlSearchParams, {
      availability: "all",
      options: {},
      categories: [],
      subcategories: [],
      applications: [],
      sort: "featured",
    })
    const q = params.toString()
    router.push(q ? `/products?${q}` : "/products", { scroll: false })
  }

  // Pagination
  const itemsPerPage = catalogType === "application" ? 10 : ITEMS_PER_PAGE
  const totalPages = Math.ceil(allDisplayProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return allDisplayProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [allDisplayProducts, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Track primary vs fallback sections
  const primaryCount = primaryProducts.length
  const showPrimarySection = config.filterPrimaryProducts && primaryCount > 0
  const showFallbackSection = config.fallbackToAll && fallbackProducts.length > 0

  // Reset to page 1 when filters, search, or catalog type change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, urlSearchParams, catalogType])

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
          slug={activeApplication.slug || activeApplication.handle}
          variant={config.bannerVariant || "full"}
          products={productsForFilters}
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
          products={productsForFilters}
        />
      )}

      {/* Elevator Type Banner - Full Width */}
      {config.showBanner && activeType && !activeApplication && !currentCategory && (
        <CatalogBanner
          title={activeType.title}
          subtitle={activeType.subtitle || activeType.description}
          backgroundImage={activeType.banner_image || activeType.thumbnail_image || "/images/image.png"}
          categories={[]}
          type="elevator-type"
          slug={activeType.slug}
          variant={config.bannerVariant || "full"}
          products={productsForFilters}
        />
      )}

      {/* Browse All Banner - Full Width (Only for browse-all or collection type and when banners exist) */}
      {config.showBanner && !activeApplication && !currentCategory && (catalogType === "browse-all" || catalogType === "collection") && banners.length > 0 && (
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

      {/* Collection Header - Only for browse-all type with collection (not for collection catalog) */}
      {catalogType === "browse-all" && activeCollection && (
        <div className="max-w-[1400px] mx-auto px-8 pt-8 mt-[70px]">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {activeCollection.title || activeCollection.name}
                </h1>
                {activeCollection.description && (
                  <p className="text-gray-600 mb-3">{activeCollection.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  {allDisplayProducts.length} {allDisplayProducts.length === 1 ? 'Product' : 'Products'}
                </p>
              </div>
            </div>
          </div>
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
                  href={`/products?q=${encodeURIComponent(keyword)}`}
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
            <UnifiedFilterSidebar
              products={productsForFilters}
              totalProducts={allDisplayProducts.length}
              applications={activeApplication?.categories?.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                count: cat.product_count
              })) || []}
              categories={categories.filter(c => !c.parent_id).map(c => ({
                id: c.id,
                name: c.name
              }))}
              subcategories={categories.filter(c => c.parent_id).map(c => ({
                id: c.id,
                name: c.name
              }))}
            />

            {/* Products Column */}
            <div className="flex-1 min-w-0">
              <ActiveFilterChips
                filters={activeFilterChips}
                onRemove={handleRemoveChip}
                onClearAll={handleClearAllFilters}
              />
              {/* Collection Title and Description for collection type */}
              {catalogType === "collection" && activeCollection && (
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {activeCollection.title || activeCollection.name}
                  </h1>
                  {activeCollection.description && (
                    <p className="text-gray-600 text-base">{activeCollection.description}</p>
                  )}
                </div>
              )}

              {/* Primary Section Header - Only for non-collection types */}
              {showPrimarySection && catalogType !== "collection" && (
                <div className="mt-6 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {config.title}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{primaryCount} products</p>
                </div>
              )}

              {/* Product Grid - Special handling for collection type */}
              {catalogType === "collection" ? (
                /* Collection Type: Show two separate sections */
                <>
                  {/* Section 1: Collection Products */}
                  {primaryProducts.length > 0 ? (
                    <>
                      <div className={`grid ${getGridColumns()}`}>
                        {primaryProducts.map((product) => {
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

                      {/* Section 2 Divider: ALL PRODUCTS */}
                      {fallbackProducts.length > 0 && (
                        <>
                          <div className="my-12 border-t border-gray-300 pt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                              ALL PRODUCTS
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Showing {fallbackProducts.length} products
                            </p>
                          </div>

                          {/* Section 2 Grid: All Products */}
                          <div className={`grid ${getGridColumns()}`}>
                            {fallbackProducts.map((product) => {
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
                        </>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      image="/empty-states/no-result-found.png"
                      title="No products in this collection"
                      description="This collection doesn't have any products yet."
                      actionLabel="Browse All Products"
                      onAction={() => {
                        router.push('/products')
                      }}
                    />
                  )}
                </>
              ) : (
                /* Standard catalog types: Show paginated products with normal sections */
                <>
                  {paginatedProducts.length > 0 ? (
                    <>
                      <div className={`grid ${getGridColumns()}`}>
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
                          onPageChange={handlePageChange}
                        />
                      )}
                    </>
                  ) : (
                    <EmptyState
                      image="/empty-states/no-result-found.png"
                      title="No results found."
                      description="We couldn't find any elevator components matching your search. Try different keywords or browse all parts."
                      actionLabel="Clear Filters & Browse All"
                      onAction={handleClearAllFilters}
                    />
                  )}
                </>
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
                    onPageChange={handlePageChange}
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

