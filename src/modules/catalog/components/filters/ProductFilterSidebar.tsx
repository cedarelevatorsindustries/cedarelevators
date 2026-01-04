"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { FilterGroup } from "./FilterGroup"
import { ActiveFilterChips } from "./ActiveFilterChips"
import { PriceRangeSlider } from "./PriceRangeSlider"
import { CheckboxFilter } from "./CheckboxFilter"
import { RatingFilter } from "./RatingFilter"
import { StockFilter } from "./StockFilter"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { FilterParams } from "@/lib/services/filterService"

interface ProductFilterSidebarProps {
  className?: string
  onFilterChange?: (filters: FilterParams) => void
}

export function ProductFilterSidebar({ className, onFilterChange }: ProductFilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Local state for filters
  const [filters, setFilters] = useState<FilterParams>({})
  const [facets, setFacets] = useState<any>(null)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 })
  const [isLoading, setIsLoading] = useState(false)
  
  // Parse filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const parsedFilters: FilterParams = {}
    
    // Category
    const category = params.get('category')
    if (category) parsedFilters.category = category.split(',')
    
    // Application
    const application = params.get('application') || params.get('app')
    if (application) parsedFilters.application = application.split(',')
    
    // Price
    const priceMin = params.get('price_min')
    const priceMax = params.get('price_max')
    if (priceMin) parsedFilters.price_min = parseFloat(priceMin)
    if (priceMax) parsedFilters.price_max = parseFloat(priceMax)
    
    // Stock
    if (params.get('in_stock') === 'true') parsedFilters.in_stock = true
    
    // Voltage
    const voltage = params.get('voltage')
    if (voltage) parsedFilters.voltage = voltage.split(',')
    
    // Rating
    const rating = params.get('rating_min')
    if (rating) parsedFilters.rating_min = parseFloat(rating)
    
    setFilters(parsedFilters)
  }, [searchParams])
  
  // Fetch facets on filter change
  useEffect(() => {
    fetchFacets()
  }, [filters])
  
  const fetchFacets = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else {
            params.set(key, String(value))
          }
        }
      })
      
      const response = await fetch(`/api/store/filters/facets?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setFacets(data.data)
        if (data.data.priceRange) {
          setPriceRange(data.data.priceRange)
        }
      }
    } catch (error) {
      console.error('Failed to fetch facets:', error)
    }
  }
  
  const updateURL = (newFilters: FilterParams) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Remove old filter params
    params.delete('category')
    params.delete('application')
    params.delete('app')
    params.delete('price_min')
    params.delete('price_max')
    params.delete('in_stock')
    params.delete('voltage')
    params.delete('rating_min')
    
    // Add new filter params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','))
        } else if (!Array.isArray(value)) {
          params.set(key, String(value))
        }
      }
    })
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    onFilterChange?.(newFilters)
  }
  
  const handleCategoryChange = (values: string[]) => {
    const newFilters = { ...filters, category: values.length > 0 ? values : undefined }
    setFilters(newFilters)
    updateURL(newFilters)
  }
  
  const handlePriceChange = (min: number, max: number) => {
    const newFilters = { 
      ...filters, 
      price_min: min !== priceRange.min ? min : undefined,
      price_max: max !== priceRange.max ? max : undefined
    }
    setFilters(newFilters)
    updateURL(newFilters)
  }
  
  const handleStockChange = (value: 'all' | 'in_stock' | 'out_of_stock') => {
    const newFilters = { 
      ...filters, 
      in_stock: value === 'in_stock' ? true : undefined,
      out_of_stock: value === 'out_of_stock' ? true : undefined
    }
    setFilters(newFilters)
    updateURL(newFilters)
  }
  
  const handleVoltageChange = (values: string[]) => {
    const newFilters = { ...filters, voltage: values.length > 0 ? values : undefined }
    setFilters(newFilters)
    updateURL(newFilters)
  }
  
  const handleRatingChange = (rating: number | undefined) => {
    const newFilters = { ...filters, rating_min: rating }
    setFilters(newFilters)
    updateURL(newFilters)
  }
  
  const handleRemoveFilter = (key: string, value?: any) => {
    const newFilters = { ...filters }
    
    if (key === 'category' && Array.isArray(newFilters.category)) {
      newFilters.category = newFilters.category.filter(v => v !== value)
      if (newFilters.category.length === 0) delete newFilters.category
    } else if (key === 'voltage' && Array.isArray(newFilters.voltage)) {
      newFilters.voltage = newFilters.voltage.filter(v => v !== value)
      if (newFilters.voltage.length === 0) delete newFilters.voltage
    } else if (key === 'price') {
      delete newFilters.price_min
      delete newFilters.price_max
    } else if (key === 'stock') {
      delete newFilters.in_stock
      delete newFilters.out_of_stock
    } else if (key === 'rating') {
      delete newFilters.rating_min
    }
    
    setFilters(newFilters)
    updateURL(newFilters)
  }
  
  const handleClearAll = () => {
    setFilters({})
    updateURL({})
  }
  
  // Get active filter chips
  const getActiveFilterChips = () => {
    const chips: { key: string; label: string; value: any }[] = []
    
    if (filters.category && Array.isArray(filters.category)) {
      filters.category.forEach(cat => {
        chips.push({ key: 'category', label: `Category: ${cat}`, value: cat })
      })
    }
    
    if (filters.price_min || filters.price_max) {
      const min = filters.price_min || priceRange.min
      const max = filters.price_max || priceRange.max
      chips.push({ key: 'price', label: `₹${min} - ₹${max}`, value: null })
    }
    
    if (filters.in_stock) {
      chips.push({ key: 'stock', label: 'In Stock', value: null })
    }
    
    if (filters.voltage && Array.isArray(filters.voltage)) {
      filters.voltage.forEach(v => {
        chips.push({ key: 'voltage', label: v, value: v })
      })
    }
    
    if (filters.rating_min) {
      chips.push({ key: 'rating', label: `${filters.rating_min}+ Stars`, value: null })
    }
    
    return chips
  }
  
  const activeChips = getActiveFilterChips()
  
  return (
    <aside className={`w-full lg:w-80 ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Filters</h3>
          {activeChips.length > 0 && (
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

        {/* Active Filters */}
        {activeChips.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <ActiveFilterChips
              filters={activeChips}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAll}
            />
          </div>
        )}

        <div className="space-y-0 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Price Range Filter */}
          <FilterGroup title="Price Range" defaultExpanded>
            <PriceRangeSlider
              min={priceRange.min}
              max={priceRange.max}
              currentMin={filters.price_min}
              currentMax={filters.price_max}
              onChange={handlePriceChange}
            />
          </FilterGroup>

          {/* Category Filter */}
          {facets?.categories && facets.categories.length > 0 && (
            <FilterGroup title="Categories" defaultExpanded>
              <CheckboxFilter
                options={facets.categories.map((c: any) => ({
                  value: c.value,
                  label: c.label,
                  count: c.count
                }))}
                selectedValues={(filters.category as string[]) || []}
                onChange={handleCategoryChange}
              />
            </FilterGroup>
          )}

          {/* Stock Availability Filter */}
          {facets?.stock && (
            <FilterGroup title="Availability">
              <StockFilter
                selectedValue={
                  filters.in_stock ? 'in_stock' : 
                  filters.out_of_stock ? 'out_of_stock' : 'all'
                }
                onChange={handleStockChange}
                counts={facets.stock}
              />
            </FilterGroup>
          )}

          {/* Voltage Filter */}
          {facets?.voltage && facets.voltage.length > 0 && (
            <FilterGroup title="Voltage">
              <CheckboxFilter
                options={facets.voltage.map((v: any) => ({
                  value: v.value,
                  label: v.label,
                  count: v.count
                }))}
                selectedValues={(filters.voltage as string[]) || []}
                onChange={handleVoltageChange}
              />
            </FilterGroup>
          )}

          {/* Rating Filter */}
          {facets?.rating && facets.rating.length > 0 && (
            <FilterGroup title="Customer Rating">
              <RatingFilter
                selectedRating={filters.rating_min}
                onChange={handleRatingChange}
                counts={facets.rating.reduce((acc: any, r: any) => {
                  acc[r.value] = r.count
                  return acc
                }, {})}
              />
            </FilterGroup>
          )}
        </div>
      </div>
    </aside>
  )
}

