"use client"

import { Product } from "@/lib/types/domain"
import { useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import ProductCard from "@/components/ui/product-card"
import { FilterBottomSheet, ActiveFilterChips } from "@/modules/catalog/components/filters"
import { BannerWithSlides } from "@/lib/types/banners"
import { BannerCarousel } from "../../components/banner-carousel"
import { EmptyState } from "@/components/ui/empty-state"
import {
  parseCatalogFiltersFromURL,
  buildCatalogFilterSearchParams,
  applyCatalogFilters,
  type CatalogSortOption,
} from "@/lib/catalog/filter-utils"

interface FilterOption {
  id: string
  name: string
  count?: number
}

interface ProductsTabProps {
  products: Product[]
  banners?: BannerWithSlides[]
  activeCollection?: any
  activeType?: any
  // Catalog filter options
  applications?: FilterOption[]
  categories?: FilterOption[]
  subcategories?: FilterOption[]
}

export default function ProductsTabTemplate({
  products,
  banners = [],
  activeCollection,
  activeType,
  applications = [],
  categories = [],
  subcategories = [],
}: ProductsTabProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlFilters = useMemo(
    () => parseCatalogFiltersFromURL(searchParams),
    [searchParams]
  )

  // Apply unified URL-driven filters & sorting to all mobile products
  const filteredProducts = useMemo(() => {
    return applyCatalogFilters(products, urlFilters)
  }, [products, urlFilters])

  // Active filter chips for mobile visibility & quick removal
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
      const match = applications.find((a) => a.id === id)
      chips.push({ key: "applications", label: match?.name || id, value: id })
    })
    urlFilters.categories.forEach((id) => {
      const match = categories.find((c) => c.id === id)
      chips.push({ key: "categories", label: match?.name || id, value: id })
    })
    urlFilters.subcategories.forEach((id) => {
      const match = subcategories.find((s) => s.id === id)
      chips.push({ key: "subcategories", label: match?.name || id, value: id })
    })
    return chips
  }, [urlFilters, applications, categories, subcategories])

  const handleSortChange = (sortId: string) => {
    const params = buildCatalogFilterSearchParams(searchParams, {
      sort: sortId as CatalogSortOption,
    })
    const queryStr = params.toString()
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false })
  }

  const handleRemoveChip = (key: string, value?: any) => {
    if (key === "availability") {
      const params = buildCatalogFilterSearchParams(searchParams, { availability: "all" })
      const q = params.toString()
      router.push(q ? `${pathname}?${q}` : pathname, { scroll: false })
      return
    }
    if (key.startsWith("option_")) {
      const optName = key.slice("option_".length)
      const nextOpts = { ...urlFilters.options }
      nextOpts[optName] = (nextOpts[optName] || []).filter((v) => v !== value)
      if (nextOpts[optName].length === 0) delete nextOpts[optName]
      const params = buildCatalogFilterSearchParams(searchParams, { options: nextOpts })
      const q = params.toString()
      router.push(q ? `${pathname}?${q}` : pathname, { scroll: false })
      return
    }
    if (key === "categories" || key === "subcategories" || key === "applications") {
      const nextArr = urlFilters[key].filter((v) => v !== value)
      const params = buildCatalogFilterSearchParams(searchParams, { [key]: nextArr })
      const q = params.toString()
      router.push(q ? `${pathname}?${q}` : pathname, { scroll: false })
    }
  }

  const handleClearAll = () => {
    const params = buildCatalogFilterSearchParams(searchParams, {
      availability: "all",
      options: {},
      applications: [],
      categories: [],
      subcategories: [],
      sort: "featured",
    })
    const q = params.toString()
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  // Filter products for collection display
  const { collectionProducts, otherProducts } = useMemo(() => {
    if (!activeCollection || !activeCollection.products) {
      return { collectionProducts: [], otherProducts: filteredProducts }
    }

    const collectionProductIds = activeCollection.products
      .map((p: any) => {
        if (typeof p === "object") {
          return p.product_id || p.product?.id || p.id
        }
        return p
      })
      .filter(Boolean)

    const inCollection = filteredProducts.filter((p) => collectionProductIds.includes(p.id))
    const notInCollection = filteredProducts.filter((p) => !collectionProductIds.includes(p.id))

    return { collectionProducts: inCollection, otherProducts: notInCollection }
  }, [filteredProducts, activeCollection])

  return (
    <div className="pb-20">
      {/* Banner - Only show if banners exist */}
      {banners.length > 0 && (
        <div className="p-4">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* Elevator Type Banner */}
      {activeType && (
        <div className="relative">
          {activeType.banner_image && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={activeType.banner_image}
                alt={activeType.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl md:text-3xl text-white mb-2">
                  {activeType.title}
                </h1>
                {(activeType.subtitle || activeType.description) && (
                  <p className="text-white/90 text-sm md:text-base max-w-md">
                    {activeType.subtitle || activeType.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collection Display - Two Sections */}
      {activeCollection ? (
        <>
          <div className="px-4 py-4 bg-white">
            <h1 className="text-xl text-gray-900 mb-1">
              {activeCollection.title || activeCollection.name}
            </h1>
            {activeCollection.description && (
              <p className="text-sm text-gray-600">{activeCollection.description}</p>
            )}
          </div>

          {collectionProducts.length > 0 ? (
            <div className="mt-4 bg-white">
              <div className="px-4 py-3 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base text-gray-900">Products</h2>
                  <span className="text-sm text-gray-600">{collectionProducts.length} items</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 px-4 py-4">
                {collectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="mobile" />
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-600">No products in this collection</p>
            </div>
          )}

          {otherProducts.length > 0 && (
            <div className="mt-6 bg-white">
              <div className="px-4 py-3 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base text-gray-900">ALL PRODUCTS</h2>
                  <span className="text-sm text-gray-600">{otherProducts.length} products</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 px-4 py-4">
                {otherProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="mobile" />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Standard All Products Display */
        <div className="mt-4 bg-white">
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base text-gray-900">All Products</h2>
                <p className="text-xs text-gray-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Sort products"
                  value={urlFilters.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="h-9 px-2.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="newest">Newest</option>
                </select>
                <FilterBottomSheet
                  variant="icon"
                  products={products}
                  applications={applications}
                  categories={categories}
                  subcategories={subcategories}
                />
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="mt-3">
                <ActiveFilterChips
                  filters={activeFilterChips}
                  onRemove={handleRemoveChip}
                  onClearAll={handleClearAll}
                />
              </div>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 px-4 py-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="mobile" />
              ))}
            </div>
          ) : (
            <div className="px-4 py-8">
              <EmptyState
                image="/empty-states/no-result-found.png"
                title="No results found."
                description="No products match your selected filters."
                actionLabel="Clear All Filters"
                onAction={handleClearAll}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
