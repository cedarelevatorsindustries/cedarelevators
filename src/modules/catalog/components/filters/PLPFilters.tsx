"use client"

import { FilterGroup } from "./FilterGroup"
import { StockFilter } from "./StockFilter"
import { VariantOptionFilter } from "./VariantOptionFilter"
import type { PLPFilters, AvailablePLPOptions } from "@/lib/types/filters"

interface PLPFiltersProps {
    filters: PLPFilters
    onChange: (filters: PLPFilters) => void
    availableOptions: AvailablePLPOptions
    hideExtraFilters?: boolean
}

export function PLPFiltersComponent({
    filters,
    onChange,
    availableOptions,
    hideExtraFilters = false
}: PLPFiltersProps) {
    const handleAvailabilityChange = (value: 'all' | 'in_stock' | 'out_of_stock') => {
        onChange({
            ...filters,
            availability: value === 'all' ? undefined : value as 'in_stock' | 'out_of_stock'
        })
    }

    const handleSortChange = (value: string) => {
        onChange({
            ...filters,
            sort: value === 'default' ? undefined : value as PLPFilters['sort']
        })
    }

    const handlePriceChange = (min: number, max: number) => {
        onChange({ ...filters, priceRange: { min, max } })
    }

    const handleRatingChange = (rating: number | undefined) => {
        onChange({ ...filters, minRating: rating })
    }

    const handleVariantOptionChange = (optionName: string, selected: string[]) => {
        const newVariantOptions = { ...filters.variantOptions }
        if (selected.length > 0) {
            newVariantOptions[optionName] = selected
        } else {
            delete newVariantOptions[optionName]
        }
        onChange({
            ...filters,
            variantOptions: Object.keys(newVariantOptions).length > 0 ? newVariantOptions : undefined
        })
    }

    return (
        <div className="space-y-4">
            {/* Sort */}


            {/* Availability */}
            <FilterGroup title="Availability" defaultExpanded>
                <StockFilter
                    selectedValue={
                        filters.availability === 'in_stock' ? 'in_stock' :
                            filters.availability === 'out_of_stock' ? 'out_of_stock' : 'all'
                    }
                    onChange={handleAvailabilityChange}
                />
            </FilterGroup>

            {/* Dynamic Variant Options */}
            {Object.entries(availableOptions.variantOptions).map(([optionName, values]) => (
                <FilterGroup key={optionName} title={optionName}>
                    <VariantOptionFilter
                        optionName={optionName}
                        options={values}
                        selected={filters.variantOptions?.[optionName] || []}
                        onChange={(selected) => handleVariantOptionChange(optionName, selected)}
                    />
                </FilterGroup>
            ))}

            {/* Price Range */}


            {/* Rating */}

        </div>
    )
}
