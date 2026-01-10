"use client"

import { FilterGroup } from "./FilterGroup"
import { StockFilter } from "./StockFilter"
import { SortFilter } from "./SortFilter"
import { VariantOptionFilter } from "./VariantOptionFilter"
import type { PLPFilters, AvailablePLPOptions } from "@/lib/types/filters"

interface PLPFiltersProps {
    filters: PLPFilters
    onChange: (filters: PLPFilters) => void
    availableOptions: AvailablePLPOptions
}

export function PLPFiltersComponent({
    filters,
    onChange,
    availableOptions
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
            <FilterGroup title="Sort By" defaultExpanded>
                <SortFilter
                    value={filters.sort || 'default'}
                    onChange={handleSortChange}
                />
            </FilterGroup>

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
        </div>
    )
}
