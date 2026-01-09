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

export function UnifiedFilterSidebar({ className }: UnifiedFilterSidebarProps) {
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

    const updateURL = () => {
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
        if (catalogFilters.applications?.length) params.set('applications', catalogFilters.applications.join(','))
        if (catalogFilters.elevatorTypes?.length) params.set('elevator_types', catalogFilters.elevatorTypes.join(','))
        if (catalogFilters.categories?.length) params.set('categories', catalogFilters.categories.join(','))
        if (catalogFilters.subcategories?.length) params.set('subcategories', catalogFilters.subcategories.join(','))

        // Add PLP filters
        if (plpFilters.availability) params.set('availability', plpFilters.availability)
        if (plpFilters.priceRange) {
            params.set('price_min', String(plpFilters.priceRange.min))
            params.set('price_max', String(plpFilters.priceRange.max))
        }
        if (plpFilters.minRating) params.set('min_rating', String(plpFilters.minRating))

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const handleCatalogChange = (filters: CatalogFiltersType) => {
        setCatalogFilters(filters)
        setTimeout(updateURL, 0)
    }

    const handlePLPChange = (filters: PLPFiltersType) => {
        setPLPFilters(filters)
        setTimeout(updateURL, 0)
    }

    const handleClearAll = () => {
        setCatalogFilters({})
        setPLPFilters({})
        router.push(pathname, { scroll: false })
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
                    />
                </div>
            </div>
        </aside>
    )
}
