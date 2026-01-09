"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SlidersHorizontal } from "lucide-react"
import { CatalogFiltersComponent } from "./CatalogFilters"
import type { CatalogFilters as CatalogFiltersType, AvailableCatalogOptions } from "@/lib/types/filters"

export function FilterBottomSheet({ variant = 'default' }: { variant?: 'default' | 'icon' }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)

    // Filter state
    const [catalogFilters, setCatalogFilters] = useState<CatalogFiltersType>({})

    // Available options
    const [catalogOptions, setCatalogOptions] = useState<AvailableCatalogOptions>({
        applications: [],
        elevatorTypes: [],
        categories: [],
        subcategories: []
    })

    // Parse filters from URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        const applications = params.get('applications')?.split(',').filter(Boolean)
        const elevatorTypes = params.get('elevator_types')?.split(',').filter(Boolean)
        const categories = params.get('categories')?.split(',').filter(Boolean)
        const subcategories = params.get('subcategories')?.split(',').filter(Boolean)

        setCatalogFilters({ applications, elevatorTypes, categories, subcategories })
    }, [searchParams])

    // Fetch options
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
            }
        } catch (error) {
            console.error('Failed to fetch filter options:', error)
        }
    }

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        // Clear old params
        params.delete('applications')
        params.delete('elevator_types')
        params.delete('categories')
        params.delete('subcategories')

        // Add catalog filters
        if (catalogFilters.applications?.length) params.set('applications', catalogFilters.applications.join(','))
        if (catalogFilters.elevatorTypes?.length) params.set('elevator_types', catalogFilters.elevatorTypes.join(','))
        if (catalogFilters.categories?.length) params.set('categories', catalogFilters.categories.join(','))
        if (catalogFilters.subcategories?.length) params.set('subcategories', catalogFilters.subcategories.join(','))

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        setOpen(false)
    }

    const clearAll = () => {
        setCatalogFilters({})
        router.push(pathname, { scroll: false })
        setOpen(false)
    }

    const activeFilterCount =
        (catalogFilters.applications?.length || 0) +
        (catalogFilters.elevatorTypes?.length || 0) +
        (catalogFilters.categories?.length || 0) +
        (catalogFilters.subcategories?.length || 0)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {variant === 'icon' ? (
                    <Button variant="ghost" className="relative h-10 w-10 p-0 hover:bg-transparent">
                        <SlidersHorizontal className="h-5 w-5" />
                        {activeFilterCount > 0 && (
                            <span className="absolute top-1 right-1 bg-orange-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
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
                side="bottom"
                className="h-[85vh] bg-white border-t border-gray-200"
            >
                <SheetHeader className="px-4 pt-4 pb-0">
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                <ScrollArea className="h-[calc(85vh-140px)] mt-2">
                    <div className="space-y-6 px-4 pb-4">
                        {/* Catalog Filters Only */}
                        <CatalogFiltersComponent
                            filters={catalogFilters}
                            onChange={setCatalogFilters}
                            availableOptions={catalogOptions}
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
