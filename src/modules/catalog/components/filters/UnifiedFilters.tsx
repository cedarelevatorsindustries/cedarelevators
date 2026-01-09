"use client"

import { FilterGroup } from "./FilterGroup"
import { CheckboxFilter } from "./CheckboxFilter"
import { PriceRangeSlider } from "./PriceRangeSlider"
import { RatingFilter } from "./RatingFilter"
import { RadioFilter } from "./RadioFilter"
import { SortFilter } from "./SortFilter"
import type {
    CatalogFilters,
    PLPFilters,
    AvailableCatalogOptions,
    AvailablePLPOptions
} from "@/lib/types/filters"

interface UnifiedFiltersProps {
    catalogFilters: CatalogFilters
    plpFilters: PLPFilters
    onCatalogChange: (filters: CatalogFilters) => void
    onPLPChange: (filters: PLPFilters) => void
    catalogOptions: AvailableCatalogOptions
    plpOptions: AvailablePLPOptions
    showCatalogFilters?: boolean // legacy prop for Elevator Types
    mode?: 'plp' | 'catalog'
}

export function UnifiedFiltersComponent({
    catalogFilters,
    plpFilters,
    onCatalogChange,
    onPLPChange,
    catalogOptions,
    plpOptions,
    showCatalogFilters = false,
    mode = showCatalogFilters ? 'catalog' : 'plp'
}: UnifiedFiltersProps) {

    // Catalog filter handlers
    const handleApplicationsChange = (values: string[]) => {
        onCatalogChange({ ...catalogFilters, applications: values.length > 0 ? values : undefined })
    }

    const handleCategoriesChange = (values: string[]) => {
        onCatalogChange({ ...catalogFilters, categories: values.length > 0 ? values : undefined })
    }

    const handleSubcategoriesChange = (values: string[]) => {
        onCatalogChange({ ...catalogFilters, subcategories: values.length > 0 ? values : undefined })
    }

    const handleElevatorTypesChange = (values: string[]) => {
        onCatalogChange({ ...catalogFilters, elevatorTypes: values.length > 0 ? values : undefined })
    }

    // PLP filter handlers
    const handleAvailabilityChange = (value: string) => {
        onPLPChange({
            ...plpFilters,
            availability: value as 'in_stock' | 'out_of_stock' | 'made_to_order' | undefined
        })
    }

    const handlePriceChange = (min: number, max: number) => {
        onPLPChange({ ...plpFilters, priceRange: { min, max } })
    }

    const handleRatingChange = (rating: number | undefined) => {
        onPLPChange({ ...plpFilters, minRating: rating })
    }

    const handleSortChange = (value: string) => {
        onPLPChange({
            ...plpFilters,
            sort: value as PLPFilters['sort']
        })
    }

    const handleVariantOptionChange = (optionName: string, values: string[]) => {
        const currentOptions = plpFilters.variantOptions || {}
        const newOptions = { ...currentOptions }

        if (values.length > 0) {
            newOptions[optionName] = values
        } else {
            delete newOptions[optionName]
        }

        onPLPChange({
            ...plpFilters,
            variantOptions: Object.keys(newOptions).length > 0 ? newOptions : undefined
        })
    }

    // Section Renderers
    const renderSort = () => (
        <FilterGroup title="Sort By" defaultExpanded>
            <SortFilter
                value={plpFilters.sort || 'default'}
                onChange={handleSortChange}
            />
        </FilterGroup>
    )

    const renderCategories = () => (
        catalogOptions.categories.length > 0 && (
            <FilterGroup title="Categories" defaultExpanded>
                <CheckboxFilter
                    options={catalogOptions.categories.map(cat => ({
                        value: cat.id,
                        label: cat.name,
                        count: cat.count
                    }))}
                    selectedValues={catalogFilters.categories || []}
                    onChange={handleCategoriesChange}
                />
            </FilterGroup>
        )
    )

    const renderSubcategories = () => (
        catalogOptions.subcategories.length > 0 && (
            <FilterGroup title="Subcategories" defaultExpanded>
                <CheckboxFilter
                    options={catalogOptions.subcategories.map(sub => ({
                        value: sub.id,
                        label: sub.name,
                        count: sub.count
                    }))}
                    selectedValues={catalogFilters.subcategories || []}
                    onChange={handleSubcategoriesChange}
                />
            </FilterGroup>
        )
    )

    const renderAvailability = () => (
        <FilterGroup title="Availability" defaultExpanded>
            <RadioFilter
                options={[
                    { value: 'in_stock', label: 'In Stock' },
                    { value: 'out_of_stock', label: 'Out of Stock' },
                    { value: 'made_to_order', label: 'Made to Order' }
                ]}
                selectedValue={plpFilters.availability}
                onChange={handleAvailabilityChange}
            />
        </FilterGroup>
    )

    const renderVariantOptions = () => (
        plpOptions.variantOptions && Object.keys(plpOptions.variantOptions).length > 0 && (
            <>
                {Object.entries(plpOptions.variantOptions).map(([optionName, optionValues]) => (
                    <FilterGroup key={optionName} title={optionName} defaultExpanded>
                        <CheckboxFilter
                            options={optionValues.map(value => ({
                                value,
                                label: value
                            }))}
                            selectedValues={plpFilters.variantOptions?.[optionName] || []}
                            onChange={(values) => handleVariantOptionChange(optionName, values)}
                        />
                    </FilterGroup>
                ))}
            </>
        )
    )

    const renderPrice = () => (
        <FilterGroup title="Price Range" defaultExpanded>
            <PriceRangeSlider
                min={plpOptions.priceRange.min}
                max={plpOptions.priceRange.max}
                currentMin={plpFilters.priceRange?.min}
                currentMax={plpFilters.priceRange?.max}
                onChange={handlePriceChange}
            />
        </FilterGroup>
    )

    const renderRating = () => (
        <FilterGroup title="Customer Rating">
            <RatingFilter
                selectedRating={plpFilters.minRating}
                onChange={handleRatingChange}
            />
        </FilterGroup>
    )

    const renderApplications = () => (
        catalogOptions.applications.length > 0 && (
            <FilterGroup title="Applications">
                <CheckboxFilter
                    options={catalogOptions.applications.map(app => ({
                        value: app.id,
                        label: app.name,
                        count: app.count
                    }))}
                    selectedValues={catalogFilters.applications || []}
                    onChange={handleApplicationsChange}
                />
            </FilterGroup>
        )
    )

    const renderElevatorTypes = () => (
        catalogOptions.elevatorTypes.length > 0 && (
            <FilterGroup title="Elevator Types">
                <CheckboxFilter
                    options={catalogOptions.elevatorTypes.map(type => ({
                        value: type.id,
                        label: type.name,
                        count: type.count
                    }))}
                    selectedValues={catalogFilters.elevatorTypes || []}
                    onChange={handleElevatorTypesChange}
                />
            </FilterGroup>
        )
    )

    if (mode === 'plp') {
        // PLP Order: Categories -> Subcategories -> Availability -> Variant Options -> Price -> Sort -> Applications -> Ratings
        return (
            <div className="space-y-4 pl-4">
                {renderCategories()}
                {renderSubcategories()}
                {renderAvailability()}
                {renderVariantOptions()}
                {renderPrice()}
                {renderSort()}
                {renderApplications()}
                {renderRating()}
            </div>
        )
    } else {
        // Catalog Order: Sort -> Price -> Review -> Availability -> Variant Options -> Elevator Types
        return (
            <div className="space-y-4 pl-4">
                {renderSort()}
                {renderPrice()}
                {renderRating()}
                {renderAvailability()}
                {renderVariantOptions()}
                {renderElevatorTypes()}
            </div>
        )
    }
}
