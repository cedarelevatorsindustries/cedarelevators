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

interface FilterOption {
    id: string
    name: string
    count?: number
}

interface FilterBottomSheetProps {
    variant?: 'default' | 'icon'
    products?: Product[]
    // Catalog-specific filter options (only shown on main catalog page)
    applications?: FilterOption[]
    categories?: FilterOption[]
    subcategories?: FilterOption[]
}

export function FilterBottomSheet({
    variant = 'default',
    products = [],
    applications = [],
    categories = [],
    subcategories = []
}: FilterBottomSheetProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)

    // Filter state
    const [availability, setAvailability] = useState<'all' | 'in_stock' | 'out_of_stock'>('all')
    // Store selected values per option name: { "Size": ["9mm", "5mm"], "Voltage": ["24V"] }
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
    // Catalog-specific filters
    const [selectedApplications, setSelectedApplications] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])

    // Extract variant options grouped by option name
    const variantOptions = useMemo(() => {
        const optionGroups: Record<string, Set<string>> = {}
        products.forEach(p => {
            p.variants?.forEach(v => {
                // Extract from options object if available
                if (v.options && typeof v.options === 'object') {
                    Object.entries(v.options).forEach(([optionName, optionValue]) => {
                        if (optionName && optionValue && String(optionValue).toLowerCase() !== 'default') {
                            // Normalize option name (capitalize first letter)
                            const normalizedName = optionName.charAt(0).toUpperCase() + optionName.slice(1).toLowerCase()
                            if (!optionGroups[normalizedName]) {
                                optionGroups[normalizedName] = new Set()
                            }
                            optionGroups[normalizedName].add(String(optionValue))
                        }
                    })
                }
            })
        })
        // Convert Sets to Arrays
        const result: Record<string, string[]> = {}
        Object.entries(optionGroups).forEach(([name, values]) => {
            result[name] = Array.from(values).sort()
        })
        return result
    }, [products])

    // Parse filters from URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        const avail = params.get('availability')
        if (avail === 'in_stock' || avail === 'out_of_stock') {
            setAvailability(avail)
        }

        // Parse options from URL (format: option_Size=9mm,5mm&option_Voltage=24V)
        const newSelectedOptions: Record<string, string[]> = {}
        Object.keys(variantOptions).forEach(optionName => {
            const key = `option_${optionName}`
            const values = params.get(key)?.split(',').filter(Boolean) || []
            if (values.length > 0) {
                newSelectedOptions[optionName] = values
            }
        })
        setSelectedOptions(newSelectedOptions)

        // Parse catalog filters
        setSelectedApplications(params.get('applications')?.split(',').filter(Boolean) || [])
        setSelectedCategories(params.get('categories')?.split(',').filter(Boolean) || [])
        setSelectedSubcategories(params.get('subcategories')?.split(',').filter(Boolean) || [])
    }, [searchParams, variantOptions])

    const handleOptionChange = (optionName: string, values: string[]) => {
        setSelectedOptions(prev => {
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
        const params = new URLSearchParams(searchParams.toString())

        // Clear old params
        params.delete('availability')
        params.delete('applications')
        params.delete('categories')
        params.delete('subcategories')
        // Clear all option_ params
        Object.keys(variantOptions).forEach(optionName => {
            params.delete(`option_${optionName}`)
        })

        // Add new params
        if (availability !== 'all') {
            params.set('availability', availability)
        }

        // Add selected options
        Object.entries(selectedOptions).forEach(([optionName, values]) => {
            if (values.length > 0) {
                params.set(`option_${optionName}`, values.join(','))
            }
        })

        // Add catalog filters
        if (selectedApplications.length > 0) {
            params.set('applications', selectedApplications.join(','))
        }
        if (selectedCategories.length > 0) {
            params.set('categories', selectedCategories.join(','))
        }
        if (selectedSubcategories.length > 0) {
            params.set('subcategories', selectedSubcategories.join(','))
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        setOpen(false)
    }

    const clearAll = () => {
        setAvailability('all')
        setSelectedOptions({})
        setSelectedApplications([])
        setSelectedCategories([])
        setSelectedSubcategories([])
    }

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = availability !== 'all' ? 1 : 0
        Object.values(selectedOptions).forEach(values => {
            count += values.length
        })
        count += selectedApplications.length
        count += selectedCategories.length
        count += selectedSubcategories.length
        return count
    }, [availability, selectedOptions, selectedApplications, selectedCategories, selectedSubcategories])

    const hasVariantOptions = Object.keys(variantOptions).length > 0
    const hasCatalogFilters = applications.length > 0 || categories.length > 0 || subcategories.length > 0

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

                <div className="overflow-y-auto h-[calc(85vh-140px)] mt-4">
                    <div className="space-y-0 px-4 pb-4">
                        {/* Availability Filter */}
                        <FilterGroup title="Availability">
                            <StockFilter
                                selectedValue={availability}
                                onChange={setAvailability}
                            />
                        </FilterGroup>

                        {/* Variant Option Filters - Grouped by Option Name */}
                        {hasVariantOptions && Object.entries(variantOptions).map(([optionName, values]) => (
                            <FilterGroup key={optionName} title={optionName}>
                                <CheckboxFilter
                                    options={values.map(v => ({ value: v, label: v }))}
                                    selectedValues={selectedOptions[optionName] || []}
                                    onChange={(selected) => handleOptionChange(optionName, selected)}
                                />
                            </FilterGroup>
                        ))}

                        {/* Catalog-Specific Filters (only on main catalog page) */}
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
                    </div>
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
