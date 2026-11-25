"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FilterGroup } from "./FilterGroup"
import { StockFilter } from "./StockFilter"
import { CheckboxFilter } from "./CheckboxFilter"
import type { Product } from "@/lib/types/domain"
import {
  extractVariantOptions,
  parseCatalogFiltersFromURL,
  buildCatalogFilterSearchParams,
  isProductInStock,
  normalizeOptionValue,
  type AvailabilityFilter,
} from "@/lib/catalog/filter-utils"

interface FilterOption {
  id: string
  name: string
  count?: number
}

interface UnifiedFilterSidebarProps {
  className?: string
  products?: Product[]
  totalProducts?: number
  // Catalog-specific filter options
  applications?: FilterOption[]
  categories?: FilterOption[]
  subcategories?: FilterOption[]
}

export function UnifiedFilterSidebar({
  className,
  products = [],
  totalProducts,
  applications = [],
  categories = [],
  subcategories = [],
}: UnifiedFilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [availability, setAvailability] = useState<AvailabilityFilter>("all")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])

  // Extract deduplicated, naturally sorted variant options
  const variantOptions = useMemo(() => extractVariantOptions(products), [products])

  // Compute stock counts for Availability radio options
  const stockCounts = useMemo(() => {
    let inStock = 0
    let outOfStock = 0
    products.forEach((p) => {
      if (isProductInStock(p)) inStock++
      else outOfStock++
    })
    return { in_stock: inStock, out_of_stock: outOfStock }
  }, [products])

  // Sync local UI state from URL search params (single source of truth)
  useEffect(() => {
    const parsed = parseCatalogFiltersFromURL(searchParams)
    setAvailability(parsed.availability)

    // Map URL option values back to canonical display labels from variantOptions
    const mappedOptions: Record<string, string[]> = {}
    Object.entries(parsed.options).forEach(([optName, rawValues]) => {
      const availableForGroup = variantOptions[optName] || []
      const mapped = rawValues.map((rawVal) => {
        const norm = normalizeOptionValue(rawVal)
        const match = availableForGroup.find((o) => normalizeOptionValue(o.value) === norm)
        return match ? match.value : rawVal
      })
      if (mapped.length > 0) {
        mappedOptions[optName] = Array.from(new Set(mapped))
      }
    })
    setSelectedOptions(mappedOptions)

    setSelectedApplications(parsed.applications)
    setSelectedCategories(parsed.categories)
    setSelectedSubcategories(parsed.subcategories)
  }, [searchParams, variantOptions])

  const pushFiltersToURL = (next: {
    availability?: AvailabilityFilter
    options?: Record<string, string[]>
    applications?: string[]
    categories?: string[]
    subcategories?: string[]
  }) => {
    const params = buildCatalogFilterSearchParams(
      searchParams,
      next,
      Object.keys(variantOptions)
    )
    const queryStr = params.toString()
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false })
  }

  const handleOptionChange = (optionName: string, values: string[]) => {
    const updated = { ...selectedOptions }
    if (values.length > 0) {
      updated[optionName] = values
    } else {
      delete updated[optionName]
    }
    setSelectedOptions(updated)
    pushFiltersToURL({ options: updated })
  }

  const handleAvailabilityChange = (value: AvailabilityFilter) => {
    setAvailability(value)
    pushFiltersToURL({ availability: value })
  }

  const handleApplicationsChange = (values: string[]) => {
    setSelectedApplications(values)
    pushFiltersToURL({ applications: values })
  }

  const handleCategoriesChange = (values: string[]) => {
    setSelectedCategories(values)
    pushFiltersToURL({ categories: values })
  }

  const handleSubcategoriesChange = (values: string[]) => {
    setSelectedSubcategories(values)
    pushFiltersToURL({ subcategories: values })
  }

  const handleClearAll = () => {
    setAvailability("all")
    setSelectedOptions({})
    setSelectedApplications([])
    setSelectedCategories([])
    setSelectedSubcategories([])

    const params = buildCatalogFilterSearchParams(
      searchParams,
      {
        availability: "all",
        options: {},
        applications: [],
        categories: [],
        subcategories: [],
        sort: "featured",
      },
      Object.keys(variantOptions)
    )
    const queryStr = params.toString()
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false })
  }

  const activeFilterCount = useMemo(() => {
    let count = availability !== "all" ? 1 : 0
    Object.values(selectedOptions).forEach((values) => {
      count += values.length
    })
    count += selectedApplications.length
    count += selectedCategories.length
    count += selectedSubcategories.length
    return count
  }, [availability, selectedOptions, selectedApplications, selectedCategories, selectedSubcategories])

  const hasVariantOptions = Object.keys(variantOptions).length > 0

  return (
    <aside className={`w-full lg:w-72 xl:w-80 flex-shrink-0 ${className || ""}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {totalProducts !== undefined && (
              <p className="text-xs text-gray-500 mt-0.5">
                {totalProducts.toLocaleString()} {totalProducts === 1 ? "product" : "products"}
              </p>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-2.5 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-0">
          {/* Availability Filter */}
          <FilterGroup title="Availability">
            <StockFilter
              selectedValue={availability}
              onChange={handleAvailabilityChange}
              counts={stockCounts}
            />
          </FilterGroup>

          {/* Variant Option Filters - Grouped by Option Name */}
          {hasVariantOptions &&
            Object.entries(variantOptions).map(([optionName, values]) => (
              <FilterGroup
                key={optionName}
                title={optionName}
                count={selectedOptions[optionName]?.length}
              >
                <CheckboxFilter
                  options={values}
                  selectedValues={selectedOptions[optionName] || []}
                  onChange={(selected) => handleOptionChange(optionName, selected)}
                />
              </FilterGroup>
            ))}

          {/* Catalog-Specific Filters */}
          {applications.length > 0 && (
            <FilterGroup title="Applications" count={selectedApplications.length}>
              <CheckboxFilter
                options={applications.map((a) => ({
                  value: a.id,
                  label: a.name,
                  count: a.count,
                }))}
                selectedValues={selectedApplications}
                onChange={handleApplicationsChange}
              />
            </FilterGroup>
          )}

          {categories.length > 0 && (
            <FilterGroup title="Categories" count={selectedCategories.length}>
              <CheckboxFilter
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                  count: c.count,
                }))}
                selectedValues={selectedCategories}
                onChange={handleCategoriesChange}
              />
            </FilterGroup>
          )}

          {subcategories.length > 0 && (
            <FilterGroup title="Subcategories" count={selectedSubcategories.length}>
              <CheckboxFilter
                options={subcategories.map((s) => ({
                  value: s.id,
                  label: s.name,
                  count: s.count,
                }))}
                selectedValues={selectedSubcategories}
                onChange={handleSubcategoriesChange}
              />
            </FilterGroup>
          )}
        </div>
      </div>
    </aside>
  )
}
