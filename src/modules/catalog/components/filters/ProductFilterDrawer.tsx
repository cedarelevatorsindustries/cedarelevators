"use client"

import { useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { FilterGroup } from "./FilterGroup"
import { StockFilter } from "./StockFilter"
import { CheckboxFilter } from "./CheckboxFilter"
import type { Product } from "@/lib/types/domain"

interface ProductFilterDrawerProps {
    products: Product[]
    open: boolean
    onOpenChange: (open: boolean) => void
    // Filter state
    availability: 'all' | 'in_stock' | 'out_of_stock'
    onAvailabilityChange: (value: 'all' | 'in_stock' | 'out_of_stock') => void
    // Grouped variant options: { "Size": ["9mm"], "Voltage": ["24V"] }
    selectedOptions: Record<string, string[]>
    onOptionsChange: (options: Record<string, string[]>) => void
    onClearAll: () => void
}

export function ProductFilterDrawer({
    products,
    open,
    onOpenChange,
    availability,
    onAvailabilityChange,
    selectedOptions,
    onOptionsChange,
    onClearAll
}: ProductFilterDrawerProps) {
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

    const handleOptionChange = (optionName: string, values: string[]) => {
        const updated = { ...selectedOptions }
        if (values.length > 0) {
            updated[optionName] = values
        } else {
            delete updated[optionName]
        }
        onOptionsChange(updated)
    }

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = availability !== 'all' ? 1 : 0
        Object.values(selectedOptions).forEach(values => {
            count += values.length
        })
        return count
    }, [availability, selectedOptions])

    const hasVariantOptions = Object.keys(variantOptions).length > 0

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
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
                                onChange={onAvailabilityChange}
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
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClearAll}
                        className="flex-1"
                    >
                        Clear All
                    </Button>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                    >
                        Apply Filters
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// Filter chips component for displaying active filters
interface FilterChipsProps {
    availability: 'all' | 'in_stock' | 'out_of_stock'
    onAvailabilityChange: (value: 'all' | 'in_stock' | 'out_of_stock') => void
    selectedOptions: Record<string, string[]>
    onOptionsChange: (options: Record<string, string[]>) => void
    onClearAll: () => void
}

export function FilterChips({
    availability,
    onAvailabilityChange,
    selectedOptions,
    onOptionsChange,
    onClearAll
}: FilterChipsProps) {
    const totalOptionValues = Object.values(selectedOptions).reduce((sum, arr) => sum + arr.length, 0)
    const hasFilters = availability !== 'all' || totalOptionValues > 0
    const totalFilters = (availability !== 'all' ? 1 : 0) + totalOptionValues

    const handleRemoveOption = (optionName: string, value: string) => {
        const updated = { ...selectedOptions }
        updated[optionName] = (updated[optionName] || []).filter(v => v !== value)
        if (updated[optionName].length === 0) {
            delete updated[optionName]
        }
        onOptionsChange(updated)
    }

    if (!hasFilters) return null

    return (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Availability Chip */}
                {availability !== 'all' && (
                    <button
                        onClick={() => onAvailabilityChange('all')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                        <span>{availability === 'in_stock' ? 'In Stock' : 'Out of Stock'}</span>
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}

                {/* Option Value Chips */}
                {Object.entries(selectedOptions).map(([optionName, values]) =>
                    values.map(value => (
                        <button
                            key={`${optionName}-${value}`}
                            onClick={() => handleRemoveOption(optionName, value)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
                        >
                            <span>{value}</span>
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ))
                )}

                {/* Clear All */}
                {totalFilters >= 2 && (
                    <button
                        onClick={onClearAll}
                        className="inline-flex items-center px-3 py-1.5 text-orange-600 text-sm font-medium hover:text-orange-700 transition-colors underline"
                    >
                        Clear all
                    </button>
                )}
            </div>
        </div>
    )
}
