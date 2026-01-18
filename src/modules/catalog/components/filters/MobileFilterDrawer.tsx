"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { FilterGroup } from "./FilterGroup"
import { StockFilter } from "./StockFilter"
import { VariantOptionFilter } from "./VariantOptionFilter"
import { CheckboxFilter } from "./CheckboxFilter"
import type { Product } from "@/lib/types/domain"

interface FilterOption {
    id: string
    name: string
    count?: number
}

interface MobileFilterDrawerProps {
    products: Product[]
    pageType: 'catalog' | 'application' | 'category'
    // Catalog-specific filter options
    applications?: FilterOption[]
    categories?: FilterOption[]
    subcategories?: FilterOption[]
}

export function MobileFilterDrawer({
    products,
    pageType,
    applications = [],
    categories = [],
    subcategories = []
}: MobileFilterDrawerProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)

    // Filter state
    const [availability, setAvailability] = useState<'all' | 'in_stock' | 'out_of_stock'>('all')
    const [selectedVariants, setSelectedVariants] = useState<string[]>([])
    const [selectedApplications, setSelectedApplications] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])

    // Extract unique variants from products
    const availableVariants = useMemo(() => {
        const variants = new Set<string>()
        products.forEach(p => {
            p.variants?.forEach(v => {
                const title = v.variant_title || v.title
                if (title && title.toLowerCase() !== 'default title') {
                    variants.add(title)
                }
            })
        })
        return Array.from(variants)
    }, [products])

    // Parse filters from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        const avail = params.get('availability')
        if (avail === 'in_stock' || avail === 'out_of_stock') {
            setAvailability(avail)
        }

        const variants = params.get('variants')?.split(',').filter(Boolean) || []
        setSelectedVariants(variants)

        const apps = params.get('applications')?.split(',').filter(Boolean) || []
        setSelectedApplications(apps)

        const cats = params.get('categories')?.split(',').filter(Boolean) || []
        setSelectedCategories(cats)

        const subs = params.get('subcategories')?.split(',').filter(Boolean) || []
        setSelectedSubcategories(subs)
    }, [searchParams])

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0
        if (availability !== 'all') count++
        count += selectedVariants.length
        if (pageType === 'catalog') {
            count += selectedApplications.length
            count += selectedCategories.length
            count += selectedSubcategories.length
        }
        return count
    }, [availability, selectedVariants, selectedApplications, selectedCategories, selectedSubcategories, pageType])

    // Apply filters to URL
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        // Clear old filter params
        params.delete('availability')
        params.delete('variants')
        params.delete('applications')
        params.delete('categories')
        params.delete('subcategories')

        // Add new filter params
        if (availability !== 'all') {
            params.set('availability', availability)
        }
        if (selectedVariants.length > 0) {
            params.set('variants', selectedVariants.join(','))
        }
        if (pageType === 'catalog') {
            if (selectedApplications.length > 0) {
                params.set('applications', selectedApplications.join(','))
            }
            if (selectedCategories.length > 0) {
                params.set('categories', selectedCategories.join(','))
            }
            if (selectedSubcategories.length > 0) {
                params.set('subcategories', selectedSubcategories.join(','))
            }
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        setOpen(false)
    }

    // Clear all filters
    const clearAll = () => {
        setAvailability('all')
        setSelectedVariants([])
        setSelectedApplications([])
        setSelectedCategories([])
        setSelectedSubcategories([])
    }

    // Get active filter chips for display
    const getActiveChips = () => {
        const chips: { key: string; label: string; onRemove: () => void }[] = []

        if (availability !== 'all') {
            chips.push({
                key: 'availability',
                label: availability === 'in_stock' ? 'In Stock' : 'Out of Stock',
                onRemove: () => setAvailability('all')
            })
        }

        selectedVariants.forEach(v => {
            chips.push({
                key: `variant-${v}`,
                label: v,
                onRemove: () => setSelectedVariants(prev => prev.filter(x => x !== v))
            })
        })

        return chips
    }

    const chips = getActiveChips()

    return (
        <>
            {/* Filter Trigger Button */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 p-0 hover:bg-transparent">
                        <SlidersHorizontal className="h-5 w-5" />
                        {activeFilterCount > 0 && (
                            <span className="absolute top-1 right-1 bg-orange-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>

                <SheetContent side="bottom" className="h-[85vh] bg-white border-t border-gray-200">
                    <SheetHeader className="px-4 pt-4 pb-0">
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>

                    <div className="overflow-y-auto h-[calc(85vh-140px)] mt-4">
                        <div className="space-y-0 px-4 pb-4">
                            {/* Availability Filter */}
                            <FilterGroup title="Availability">
                                <StockFilter
                                    selectedValue={availability}
                                    onChange={(value) => setAvailability(value)}
                                />
                            </FilterGroup>

                            {/* Variants Filter */}
                            {availableVariants.length > 0 && (
                                <FilterGroup title="Variants">
                                    <VariantOptionFilter
                                        optionName="Variants"
                                        options={availableVariants}
                                        selected={selectedVariants}
                                        onChange={setSelectedVariants}
                                    />
                                </FilterGroup>
                            )}

                            {/* Catalog-specific filters */}
                            {pageType === 'catalog' && (
                                <>
                                    {applications.length > 0 && (
                                        <FilterGroup title="Applications">
                                            <CheckboxFilter
                                                options={applications.map(a => ({
                                                    value: a.id,
                                                    label: a.name,
                                                    count: a.count
                                                }))}
                                                selectedValues={selectedApplications}
                                                onChange={setSelectedApplications}
                                            />
                                        </FilterGroup>
                                    )}

                                    {categories.length > 0 && (
                                        <FilterGroup title="Categories">
                                            <CheckboxFilter
                                                options={categories.map(c => ({
                                                    value: c.id,
                                                    label: c.name,
                                                    count: c.count
                                                }))}
                                                selectedValues={selectedCategories}
                                                onChange={setSelectedCategories}
                                            />
                                        </FilterGroup>
                                    )}

                                    {subcategories.length > 0 && (
                                        <FilterGroup title="Subcategories">
                                            <CheckboxFilter
                                                options={subcategories.map(s => ({
                                                    value: s.id,
                                                    label: s.name,
                                                    count: s.count
                                                }))}
                                                selectedValues={selectedSubcategories}
                                                onChange={setSelectedSubcategories}
                                            />
                                        </FilterGroup>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-2">
                        <Button
                            variant="outline"
                            onClick={clearAll}
                            className="flex-1"
                        >
                            Clear All
                        </Button>
                        <Button
                            onClick={applyFilters}
                            className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Active Filter Chips */}
            {chips.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2 flex-wrap">
                        {chips.map(chip => (
                            <button
                                key={chip.key}
                                onClick={chip.onRemove}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
                            >
                                <span>{chip.label}</span>
                                <X className="h-3.5 w-3.5" />
                            </button>
                        ))}

                        {chips.length >= 2 && (
                            <button
                                onClick={clearAll}
                                className="inline-flex items-center px-3 py-1.5 text-orange-600 text-sm font-medium hover:text-orange-700 transition-colors underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
