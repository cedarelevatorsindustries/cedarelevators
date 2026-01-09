"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SlidersHorizontal } from "lucide-react"
import { UnifiedFilters } from "./index"
import type {
    CatalogFilters,
    PLPFilters,
    AvailableCatalogOptions,
    AvailablePLPOptions
} from "@/lib/types/filters"

export function PLPFilterDrawer({ variant = 'default' }: { variant?: 'default' | 'icon' }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)

    // Filter state
    const [plpFilters, setPLPFilters] = useState<PLPFilters>({})
    const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>({})

    // Available options
    const [plpOptions, setPLPOptions] = useState<AvailablePLPOptions>({
        priceRange: { min: 0, max: 50000 },
        variantOptions: {},
        ratings: [5, 4, 3, 2, 1]
    })
    const [catalogOptions, setCatalogOptions] = useState<AvailableCatalogOptions>({
        applications: [],
        elevatorTypes: [],
        categories: [],
        subcategories: []
    })

    // Parse filters from URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        // PLP params
        const availability = params.get('availability') as any
        const minRating = params.get('min_rating') ? Number(params.get('min_rating')) : undefined
        const priceMin = params.get('price_min') ? Number(params.get('price_min')) : undefined
        const priceMax = params.get('price_max') ? Number(params.get('price_max')) : undefined
        const sort = params.get('sort') as any

        // Catalog params
        const applications = params.get('applications')?.split(',').filter(Boolean)
        const elevatorTypes = params.get('elevator_types')?.split(',').filter(Boolean)
        const categories = params.get('categories')?.split(',').filter(Boolean)
        const subcategories = params.get('subcategories')?.split(',').filter(Boolean)

        setPLPFilters({
            availability,
            minRating,
            priceRange: priceMin || priceMax ? { min: priceMin || 0, max: priceMax || 50000 } : undefined,
            sort
        })
        setCatalogFilters({ applications, elevatorTypes, categories, subcategories })
    }, [searchParams])

    // Fetch options
    useEffect(() => {
        if (open) {
            fetchFilterOptions()
        }
    }, [open, catalogFilters.categories, catalogFilters.applications, catalogFilters.elevatorTypes])

    const fetchFilterOptions = async () => {
        try {
            const params = new URLSearchParams()
            if (catalogFilters.applications) params.set('applications', catalogFilters.applications.join(','))
            if (catalogFilters.categories) params.set('categories', catalogFilters.categories.join(','))
            if (catalogFilters.elevatorTypes) params.set('elevator_types', catalogFilters.elevatorTypes.join(','))

            const response = await fetch(`/api/store/filters/options?${params.toString()}`)
            const data = await response.json()

            if (data.success) {
                if (data.plpOptions) setPLPOptions(data.plpOptions)
                if (data.catalogOptions) setCatalogOptions(data.catalogOptions)
            }
        } catch (error) {
            console.error('Failed to fetch filter options:', error)
        }
    }

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        // Clear old params
        params.delete('availability')
        params.delete('price_min')
        params.delete('price_max')
        params.delete('min_rating')
        params.delete('sort')
        params.delete('applications')
        params.delete('elevator_types')
        params.delete('categories')
        params.delete('subcategories')

        // Add PLP filters
        if (plpFilters.availability) params.set('availability', plpFilters.availability)
        if (plpFilters.priceRange) {
            params.set('price_min', String(plpFilters.priceRange.min))
            params.set('price_max', String(plpFilters.priceRange.max))
        }
        if (plpFilters.minRating) params.set('min_rating', String(plpFilters.minRating))
        if (plpFilters.sort) params.set('sort', plpFilters.sort)

        // Add Catalog filters
        if (catalogFilters.applications?.length) params.set('applications', catalogFilters.applications.join(','))
        if (catalogFilters.elevatorTypes?.length) params.set('elevator_types', catalogFilters.elevatorTypes.join(','))
        if (catalogFilters.categories?.length) params.set('categories', catalogFilters.categories.join(','))
        if (catalogFilters.subcategories?.length) params.set('subcategories', catalogFilters.subcategories.join(','))

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        setOpen(false)
    }

    const clearAll = () => {
        setPLPFilters({})
        setCatalogFilters({})
        router.push(pathname, { scroll: false })
        setOpen(false)
    }

    const activeFilterCount =
        (plpFilters.availability ? 1 : 0) +
        (plpFilters.priceRange ? 1 : 0) +
        (plpFilters.minRating ? 1 : 0) +
        (plpFilters.sort ? 1 : 0) +
        (catalogFilters.applications?.length || 0) +
        (catalogFilters.elevatorTypes?.length || 0) +
        (catalogFilters.categories?.length || 0) +
        (catalogFilters.subcategories?.length || 0)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {variant === 'icon' ? (
                    <Button variant="ghost" size="icon" className="relative h-9 w-9">
                        <SlidersHorizontal className="h-4 w-4" />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                ) : (
                    <Button variant="outline" className="relative">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                )}
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-[400px] sm:w-[540px] bg-white"
            >
                <SheetHeader className="pb-4">
                    <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-140px)]">
                    <div className="pr-4 pb-4">
                        <UnifiedFilters
                            catalogFilters={catalogFilters}
                            plpFilters={plpFilters}
                            onCatalogChange={setCatalogFilters}
                            onPLPChange={setPLPFilters}
                            catalogOptions={catalogOptions}
                            plpOptions={plpOptions}
                            mode="plp"
                        />
                    </div>
                </ScrollArea>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-2">
                    <Button variant="outline" onClick={clearAll} className="flex-1">
                        Clear All
                    </Button>
                    <Button onClick={applyFilters} className="flex-1 bg-orange-600 text-white hover:bg-orange-700">
                        Apply Filters
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
