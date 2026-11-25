"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { UnifiedFilters } from "./index"
import { extractVariantOptions, parseCatalogFiltersFromURL, buildCatalogFilterSearchParams } from "@/lib/catalog/filter-utils"
import type {
    CatalogFilters,
    PLPFilters,
    AvailableCatalogOptions,
    AvailablePLPOptions
} from "@/lib/types/filters"
import { Product } from "@/lib/types/domain"

export function CatalogFilterDrawer({ variant = 'default', products = [] }: { variant?: 'default' | 'icon', products?: Product[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)

    // Filter state
    const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>({})
    const [plpFilters, setPLPFilters] = useState<PLPFilters>({})

    // Derive available options synchronously from products (no network delay / stuck loading)
    const catalogOptions = useMemo<AvailableCatalogOptions>(() => {
        const catMap = new Map<string, { id: string; name: string; count: number }>()
        const subMap = new Map<string, { id: string; name: string; count: number }>()
        const appMap = new Map<string, { id: string; name: string; count: number }>()

        products.forEach((p: any) => {
            p.categories?.forEach((c: any) => {
                if (!c?.id) return
                const existing = catMap.get(c.id)
                if (existing) existing.count += 1
                else catMap.set(c.id, { id: c.id, name: c.name || c.title || c.id, count: 1 })
            })
            p.subcategories?.forEach((s: any) => {
                if (!s?.id) return
                const existing = subMap.get(s.id)
                if (existing) existing.count += 1
                else subMap.set(s.id, { id: s.id, name: s.name || s.title || s.id, count: 1 })
            })
            p.applications?.forEach((a: any) => {
                if (!a?.id) return
                const existing = appMap.get(a.id)
                if (existing) existing.count += 1
                else appMap.set(a.id, { id: a.id, name: a.name || a.title || a.id, count: 1 })
            })
        })

        return {
            applications: Array.from(appMap.values()),
            elevatorTypes: [],
            categories: Array.from(catMap.values()),
            subcategories: Array.from(subMap.values()),
        }
    }, [products])

    const plpOptions = useMemo<AvailablePLPOptions>(() => {
        const rawOptions = extractVariantOptions(products)
        const variantOptions: Record<string, string[]> = {}
        Object.entries(rawOptions).forEach(([key, values]) => {
            if (values.length > 0) {
                variantOptions[key] = values.map((v) => v.value)
            }
        })
        return {
            priceRange: { min: 0, max: 50000 },
            variantOptions,
            ratings: [5, 4, 3, 2, 1],
        }
    }, [products])

    // Parse filters from URL
    useEffect(() => {
        const parsed = parseCatalogFiltersFromURL(searchParams)
        setCatalogFilters({
            applications: parsed.applications.length > 0 ? parsed.applications : undefined,
            categories: parsed.categories.length > 0 ? parsed.categories : undefined,
            subcategories: parsed.subcategories.length > 0 ? parsed.subcategories : undefined,
        })
        setPLPFilters({
            availability: parsed.availability !== 'all' ? (parsed.availability as any) : undefined,
            variantOptions: Object.keys(parsed.options).length > 0 ? parsed.options : undefined,
            sort: parsed.sort !== 'featured' ? (parsed.sort as any) : undefined,
        })
    }, [searchParams])

    const applyFilters = () => {
        const params = buildCatalogFilterSearchParams(searchParams, {
            availability: (plpFilters.availability as any) || 'all',
            options: plpFilters.variantOptions || {},
            categories: catalogFilters.categories || [],
            subcategories: catalogFilters.subcategories || [],
            applications: catalogFilters.applications || [],
            sort: (plpFilters.sort as any) || 'featured',
        })
        const query = params.toString()
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
        setOpen(false)
    }

    const clearAll = () => {
        setCatalogFilters({})
        setPLPFilters({})
        const params = buildCatalogFilterSearchParams(searchParams, {
            availability: 'all',
            options: {},
            categories: [],
            subcategories: [],
            applications: [],
            sort: 'featured',
        })
        const query = params.toString()
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
        setOpen(false)
    }

    const activeVariantOptionCount = Object.values(plpFilters.variantOptions || {}).reduce(
        (sum, vals) => sum + vals.length,
        0
    )
    const activeFilterCount =
        (catalogFilters.applications?.length || 0) +
        (catalogFilters.elevatorTypes?.length || 0) +
        (catalogFilters.categories?.length || 0) +
        (catalogFilters.subcategories?.length || 0) +
        (plpFilters.availability ? 1 : 0) +
        activeVariantOptionCount +
        (plpFilters.sort ? 1 : 0)

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

                <div className="flex flex-col h-[calc(100vh-140px)] overflow-y-auto pr-2">
                    <UnifiedFilters
                        catalogFilters={catalogFilters}
                        plpFilters={plpFilters}
                        onCatalogChange={setCatalogFilters}
                        onPLPChange={setPLPFilters}
                        catalogOptions={catalogOptions}
                        plpOptions={plpOptions}
                        mode="catalog"
                    />
                </div>

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
