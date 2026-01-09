"use client"

import { FilterGroup } from "./FilterGroup"
import { CheckboxFilter } from "./CheckboxFilter"
import type { CatalogFilters, AvailableCatalogOptions } from "@/lib/types/filters"

interface CatalogFiltersProps {
    filters: CatalogFilters
    onChange: (filters: CatalogFilters) => void
    availableOptions: AvailableCatalogOptions
}

export function CatalogFiltersComponent({
    filters,
    onChange,
    availableOptions
}: CatalogFiltersProps) {
    const handleApplicationsChange = (values: string[]) => {
        onChange({ ...filters, applications: values.length > 0 ? values : undefined })
    }

    const handleElevatorTypesChange = (values: string[]) => {
        onChange({ ...filters, elevatorTypes: values.length > 0 ? values : undefined })
    }

    const handleCategoriesChange = (values: string[]) => {
        onChange({ ...filters, categories: values.length > 0 ? values : undefined })
    }

    const handleSubcategoriesChange = (values: string[]) => {
        onChange({ ...filters, subcategories: values.length > 0 ? values : undefined })
    }

    return (
        <div className="space-y-4">
            {/* Applications */}
            {availableOptions.applications.length > 0 && (
                <FilterGroup title="Applications" defaultExpanded>
                    <CheckboxFilter
                        options={availableOptions.applications.map(app => ({
                            value: app.id,
                            label: app.name,
                            count: app.count
                        }))}
                        selectedValues={filters.applications || []}
                        onChange={handleApplicationsChange}
                    />
                </FilterGroup>
            )}

            {/* Elevator Types */}
            {availableOptions.elevatorTypes.length > 0 && (
                <FilterGroup title="Elevator Types">
                    <CheckboxFilter
                        options={availableOptions.elevatorTypes.map(type => ({
                            value: type.id,
                            label: type.name,
                            count: type.count
                        }))}
                        selectedValues={filters.elevatorTypes || []}
                        onChange={handleElevatorTypesChange}
                    />
                </FilterGroup>
            )}

            {/* Categories */}
            {availableOptions.categories.length > 0 && (
                <FilterGroup title="Categories">
                    <CheckboxFilter
                        options={availableOptions.categories.map(cat => ({
                            value: cat.id,
                            label: cat.name,
                            count: cat.count
                        }))}
                        selectedValues={filters.categories || []}
                        onChange={handleCategoriesChange}
                    />
                </FilterGroup>
            )}

            {/* Subcategories */}
            {availableOptions.subcategories.length > 0 && (
                <FilterGroup title="Subcategories">
                    <CheckboxFilter
                        options={availableOptions.subcategories.map(sub => ({
                            value: sub.id,
                            label: sub.name,
                            count: sub.count
                        }))}
                        selectedValues={filters.subcategories || []}
                        onChange={handleSubcategoriesChange}
                    />
                </FilterGroup>
            )}
        </div>
    )
}
