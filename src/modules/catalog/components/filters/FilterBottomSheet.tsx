"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
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

interface FilterBottomSheetProps {
  variant?: "default" | "icon"
  products?: Product[]
  applications?: FilterOption[]
  categories?: FilterOption[]
  subcategories?: FilterOption[]
}

export function FilterBottomSheet({
  variant = "default",
  products = [],
  applications = [],
  categories = [],
  subcategories = [],
}: FilterBottomSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const [availability, setAvailability] = useState<AvailabilityFilter>("all")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])

  const variantOptions = useMemo(() => extractVariantOptions(products), [products])

  const stockCounts = useMemo(() => {
    let inStock = 0
    let outOfStock = 0
    products.forEach((p) => {
      if (isProductInStock(p)) inStock++
      else outOfStock++
    })
    return { in_stock: inStock, out_of_stock: outOfStock }
  }, [products])

  // Sync local drawer state from URL whenever URL changes or drawer opens
  useEffect(() => {
    const parsed = parseCatalogFiltersFromURL(searchParams)
    setAvailability(parsed.availability)

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
  }, [searchParams, variantOptions, open])

  const handleOptionChange = (optionName: string, values: string[]) => {
    setSelectedOptions((prev) => {
      const updated = { ...prev }
      if (values.length > 0) {
        updated[optionName] = values
      } else {
        delete updated[optionName]
      }
      return updated
    })
  }

  const applyFilters = () => {
    const params = buildCatalogFilterSearchParams(
      searchParams,
      {
        availability,
        options: selectedOptions,
        applications: selectedApplications,
        categories: selectedCategories,
        subcategories: selectedSubcategories,
      },
      Object.keys(variantOptions)
    )
    const queryStr = params.toString()
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false })
    setOpen(false)
  }

  const clearAll = () => {
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
    setOpen(false)
  }

  // Count active filters currently applied in URL for the badge trigger
  const urlActiveCount = useMemo(() => {
    const parsed = parseCatalogFiltersFromURL(searchParams)
    let count = parsed.availability !== "all" ? 1 : 0
    Object.values(parsed.options).forEach((vals) => {
      count += vals.length
    })
    count += parsed.applications.length
    count += parsed.categories.length
    count += parsed.subcategories.length
    return count
  }, [searchParams])

  const hasVariantOptions = Object.keys(variantOptions).length > 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {variant === "icon" ? (
          <Button
            type="button"
            variant="ghost"
            className="relative h-10 w-10 p-0 hover:bg-gray-100"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-5 w-5 text-gray-700" />
            {urlActiveCount > 0 && (
              <span className="absolute top-1 right-1 bg-orange-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                {urlActiveCount}
              </span>
            )}
          </Button>
        ) : (
          <Button type="button" variant="outline" className="relative min-h-[40px]">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {urlActiveCount > 0 && (
              <span className="ml-2 bg-orange-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {urlActiveCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-[85vh] bg-white border-t border-gray-200 rounded-t-2xl"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-gray-100">
          <SheetTitle className="text-left text-lg text-gray-900">Filters</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(85vh-140px)]">
          <div className="space-y-0 px-4 pb-6 pt-2">
            {/* Availability Filter */}
            <FilterGroup title="Availability">
              <StockFilter
                selectedValue={availability}
                onChange={setAvailability}
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

            {applications.length > 0 && (
              <FilterGroup title="Applications" count={selectedApplications.length}>
                <CheckboxFilter
                  options={applications.map((a) => ({
                    value: a.id,
                    label: a.name,
                    count: a.count,
                  }))}
                  selectedValues={selectedApplications}
                  onChange={setSelectedApplications}
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
                  onChange={setSelectedCategories}
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
                  onChange={setSelectedSubcategories}
                />
              </FilterGroup>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3">
          <Button type="button" variant="outline" onClick={clearAll} className="flex-1 min-h-[44px]">
            Clear All
          </Button>
          <Button
            type="button"
            onClick={applyFilters}
            className="flex-1 min-h-[44px] bg-orange-600 text-white hover:bg-orange-700"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
