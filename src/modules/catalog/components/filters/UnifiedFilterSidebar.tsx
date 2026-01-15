"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CatalogFiltersComponent } from "./CatalogFilters"
import { PLPFiltersComponent } from "./PLPFilters"
import { ActiveFilterChips } from "./ActiveFilterChips"
import type { CatalogFilters as CatalogFiltersType, PLPFilters as PLPFiltersType, AvailableCatalogOptions, AvailablePLPOptions } from "@/lib/types/filters"

interface UnifiedFilterSidebarProps {
    className?: string
}

export function UnifiedFilterSidebar({ className, isApplicationPage = false }: { className?: string, isApplicationPage?: boolean }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Filter state
    const [catalogFilters, setCatalogFilters] = useState<CatalogFiltersType>({})
    const [plpFilters, setPLPFilters] = useState<PLPFiltersType>({})

    // Available options (from API)
    const [catalogOptions, setCatalogOptions] = useState<AvailableCatalogOptions>({
        applications: [],
        elevatorTypes: [],
        categories: [],
        subcategories: []
    })
    const [plpOptions, setPLPOptions] = useState<AvailablePLPOptions>({
        priceRange: { min: 0, max: 50000 },
        variantOptions: {},
        ratings: [3, 4, 5]
    })

    // Parse filters from URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        // Catalog filters
        const applications = params.get('applications')?.split(',').filter(Boolean)
        const elevatorTypes = params.get('elevator_types')?.split(',').filter(Boolean)
        const categories = params.get('categories')?.split(',').filter(Boolean)
        const subcategories = params.get('subcategories')?.split(',').filter(Boolean)

        setCatalogFilters({
            applications,
            elevatorTypes,
            categories,
            subcategories
        })

        // PLP filters
        const availability = params.get('availability') as 'in_stock' | 'out_of_stock' | undefined
        const minRating = params.get('min_rating') ? Number(params.get('min_rating')) : undefined
        const priceMin = params.get('price_min') ? Number(params.get('price_min')) : undefined
        const priceMax = params.get('price_max') ? Number(params.get('price_max')) : undefined

        setPLPFilters({
            availability,
            minRating,
            priceRange: priceMin || priceMax ? { min: priceMin || 0, max: priceMax || 50000 } : undefined
        })
    }, [searchParams])

    // Fetch available options
    useEffect(() => {
        fetchFilterOptions()
    }, [catalogFilters])

    const fetchFilterOptions = async () => {
        try {
            const params = new URLSearchParams()
            if (catalogFilters.applications) params.set('applications', catalogFilters.applications.join(','))
            if (catalogFilters.categories) params.set('categories', catalogFilters.categories.join(','))

            const response = await fetch(`/api/store/filters/options?${params.toString()}`)
            const data = await response.json()

            if (data.success) {
                setCatalogOptions(data.catalogOptions || catalogOptions)
                setPLPOptions(data.plpOptions || plpOptions)
            }
        } catch (error) {
            console.error('Failed to fetch filter options:', error)
        }
    }

    const applyFiltersToURL = (newCatalogFilters: CatalogFiltersType, newPLPFilters: PLPFiltersType) => {
        const params = new URLSearchParams(searchParams.toString())

        // Clear old params
        params.delete('applications')
        params.delete('elevator_types')
        params.delete('categories')
        params.delete('subcategories')
        params.delete('availability')
        params.delete('price_min')
        params.delete('price_max')
        params.delete('min_rating')

        // Add catalog filters
        if (newCatalogFilters.applications?.length) params.set('applications', newCatalogFilters.applications.join(','))
        if (newCatalogFilters.elevatorTypes?.length) params.set('elevator_types', newCatalogFilters.elevatorTypes.join(','))
        if (newCatalogFilters.categories?.length) params.set('categories', newCatalogFilters.categories.join(','))
        if (newCatalogFilters.subcategories?.length) params.set('subcategories', newCatalogFilters.subcategories.join(','))

        // Add PLP filters
        if (newPLPFilters.availability) params.set('availability', newPLPFilters.availability)
        if (newPLPFilters.priceRange) {
            params.set('price_min', String(newPLPFilters.priceRange.min))
            params.set('price_max', String(newPLPFilters.priceRange.max))
        }
        if (newPLPFilters.minRating) params.set('min_rating', String(newPLPFilters.minRating))

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const handleCatalogChange = (filters: CatalogFiltersType) => {
        setCatalogFilters(filters)
        // Use the new filters directly + current PLP filters
        applyFiltersToURL(filters, plpFilters)
    }

    const handlePLPChange = (filters: PLPFiltersType) => {
        setPLPFilters(filters)
        // Use current catalog filters + new PLP filters
        applyFiltersToURL(catalogFilters, filters)
    }

    const handleClearAll = () => {
        setCatalogFilters({})
        setPLPFilters({})
        router.push(pathname, { scroll: false })
    }

    // Active chips helpers
    const getActiveChips = () => {
        const chips: any[] = []

        if (catalogFilters.applications?.length) chips.push({ key: 'applications', label: `Apps: ${catalogFilters.applications.length}`, value: catalogFilters.applications })
        if (catalogFilters.elevatorTypes?.length) chips.push({ key: 'elevator_types', label: `Types: ${catalogFilters.elevatorTypes.length}`, value: catalogFilters.elevatorTypes })
        if (catalogFilters.categories?.length) chips.push({ key: 'categories', label: `Cats: ${catalogFilters.categories.length}`, value: catalogFilters.categories })
        if (plpFilters.availability) chips.push({ key: 'availability', label: plpFilters.availability === 'in_stock' ? 'In Stock' : 'Out of Stock', value: plpFilters.availability })
        if (plpFilters.minRating) chips.push({ key: 'min_rating', label: `${plpFilters.minRating}+ Stars`, value: plpFilters.minRating })

        return chips
    }

    const handleRemoveChip = (key: string) => {
        const newCatalog = { ...catalogFilters }
        const newPLP = { ...plpFilters }

        if (key === 'applications') delete newCatalog.applications
        if (key === 'elevator_types') delete newCatalog.elevatorTypes
        if (key === 'categories') delete newCatalog.categories
        if (key === 'availability') delete newPLP.availability
        if (key === 'min_rating') delete newPLP.minRating

        setCatalogFilters(newCatalog)
        setPLPFilters(newPLP)
        applyFiltersToURL(newCatalog, newPLP)
    }

    const hasActiveFilters =
        catalogFilters.applications?.length ||
        catalogFilters.elevatorTypes?.length ||
        catalogFilters.categories?.length ||
        catalogFilters.subcategories?.length ||
        plpFilters.availability ||
        plpFilters.priceRange ||
        plpFilters.minRating

    return (
        <aside className={`w-full lg:w-80 ${className}`}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24 overflow-visible">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-orange-600 hover:text-orange-700"
                        >
                            Clear All
                        </Button>
                    )}
                </div>

                <ActiveFilterChips
                    filters={getActiveChips()}
                    onRemove={handleRemoveChip}
                    onClearAll={handleClearAll}
                />

                <div className="space-y-6">
                    {/* Catalog Filters */}
                    <CatalogFiltersComponent
                        filters={catalogFilters}
                        onChange={handleCatalogChange}
                        availableOptions={catalogOptions}
                    />

                    <Separator />

                    {/* PLP Filters */}
                    <PLPFiltersComponent
                        filters={plpFilters}
                        onChange={handlePLPChange}
                        availableOptions={plpOptions}
                        hideExtraFilters={isApplicationPage}
                    />
                </div>
            </div>
        </aside>
    )
}
