"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FilterGroup } from "./FilterGroup"
import { StockFilter } from "./StockFilter"
import { CheckboxFilter } from "./CheckboxFilter"
import type { Product } from "@/lib/types/domain"

interface FilterOption {
    id: string
    name: string
    count?: number
}

interface UnifiedFilterSidebarProps {
    className?: string
    products?: Product[]
    // Catalog-specific filter options (only shown on main catalog page)
    applications?: FilterOption[]
    categories?: FilterOption[]
    subcategories?: FilterOption[]
}

export function UnifiedFilterSidebar({
    className,
    products = [],
    applications = [],
    categories = [],
    subcategories = []
}: UnifiedFilterSidebarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Filter state
    const [availability, setAvailability] = useState<'all' | 'in_stock' | 'out_of_stock'>('all')
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
                if (v.options && typeof v.options === 'object') {
                    Object.entries(v.options).forEach(([optionName, optionValue]) => {
                        if (optionName && optionValue && String(optionValue).toLowerCase() !== 'default') {
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
        } else {
            setAvailability('all')
        }

        // Parse variant options from URL
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
        const updated = { ...selectedOptions }
        if (values.length > 0) {
            updated[optionName] = values
        } else {
            delete updated[optionName]
        }
        setSelectedOptions(updated)
        applyFilters(availability, updated, selectedApplications, selectedCategories, selectedSubcategories)
    }

    const handleAvailabilityChange = (value: 'all' | 'in_stock' | 'out_of_stock') => {
        setAvailability(value)
        applyFilters(value, selectedOptions, selectedApplications, selectedCategories, selectedSubcategories)
    }

    const handleApplicationsChange = (values: string[]) => {
        setSelectedApplications(values)
        applyFilters(availability, selectedOptions, values, selectedCategories, selectedSubcategories)
    }

    const handleCategoriesChange = (values: string[]) => {
        setSelectedCategories(values)
        applyFilters(availability, selectedOptions, selectedApplications, values, selectedSubcategories)
    }

    const handleSubcategoriesChange = (values: string[]) => {
        setSelectedSubcategories(values)
        applyFilters(availability, selectedOptions, selectedApplications, selectedCategories, values)
    }

    const applyFilters = (
        avail: 'all' | 'in_stock' | 'out_of_stock',
        options: Record<string, string[]>,
        apps: string[],
        cats: string[],
        subs: string[]
    ) => {
        const params = new URLSearchParams(searchParams.toString())

        // Clear old params
        params.delete('availability')
        params.delete('applications')
        params.delete('categories')
        params.delete('subcategories')
        Object.keys(variantOptions).forEach(optionName => {
            params.delete(`option_${optionName}`)
        })

        // Add new params
        if (avail !== 'all') {
            params.set('availability', avail)
        }

        Object.entries(options).forEach(([optionName, values]) => {
            if (values.length > 0) {
                params.set(`option_${optionName}`, values.join(','))
            }
        })

        if (apps.length > 0) {
            params.set('applications', apps.join(','))
        }
        if (cats.length > 0) {
            params.set('categories', cats.join(','))
        }
        if (subs.length > 0) {
            params.set('subcategories', subs.join(','))
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const handleClearAll = () => {
        setAvailability('all')
        setSelectedOptions({})
        setSelectedApplications([])
        setSelectedCategories([])
        setSelectedSubcategories([])
        router.push(pathname, { scroll: false })
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

    return (
        <aside className={`w-full lg:w-80 ${className}`}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24 overflow-visible">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-orange-600 hover:text-orange-700"
                        >
                            Clear All
                        </Button>
                    )}
                </div>

                <div className="space-y-0">
                    {/* Availability Filter */}
                    <FilterGroup title="Availability" defaultExpanded>
                        <StockFilter
                            selectedValue={availability}
                            onChange={handleAvailabilityChange}
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

                    {/* Catalog-Specific Filters */}
                    {applications.length > 0 && (
                        <FilterGroup title="Applications">
                            <CheckboxFilter
                                options={applications.map(a => ({
                                    value: a.id,
                                    label: a.name,
                                    count: a.count
                                }))}
                                selectedValues={selectedApplications}
                                onChange={handleApplicationsChange}
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
                                onChange={handleCategoriesChange}
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
                                onChange={handleSubcategoriesChange}
                            />
                        </FilterGroup>
                    )}
                </div>
            </div>
        </aside>
    )
}
