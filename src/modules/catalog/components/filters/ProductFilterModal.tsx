"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FilterGroup } from "./FilterGroup"
import { PriceRangeSlider } from "./PriceRangeSlider"
import { CheckboxFilter } from "./CheckboxFilter"
import { RatingFilter } from "./RatingFilter"
import { StockFilter } from "./StockFilter"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FilterParams } from "@/lib/services/filterService"

interface ProductFilterModalProps {
  className?: string
  onFilterChange?: (filters: FilterParams) => void
}

export function ProductFilterModal({ className, onFilterChange }: ProductFilterModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterParams>({})
  const [tempFilters, setTempFilters] = useState<FilterParams>({})
  const [facets, setFacets] = useState<any>(null)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 })
  
  // Parse filters from URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const parsedFilters: FilterParams = {}
    
    const category = params.get('category')
    if (category) parsedFilters.category = category.split(',')
    
    const application = params.get('application') || params.get('app')
    if (application) parsedFilters.application = application.split(',')
    
    const priceMin = params.get('price_min')
    const priceMax = params.get('price_max')
    if (priceMin) parsedFilters.price_min = parseFloat(priceMin)
    if (priceMax) parsedFilters.price_max = parseFloat(priceMax)
    
    if (params.get('in_stock') === 'true') parsedFilters.in_stock = true
    
    const voltage = params.get('voltage')
    if (voltage) parsedFilters.voltage = voltage.split(',')
    
    const rating = params.get('rating_min')
    if (rating) parsedFilters.rating_min = parseFloat(rating)
    
    setFilters(parsedFilters)
    setTempFilters(parsedFilters)
  }, [searchParams])
  
  // Fetch facets
  useEffect(() => {
    if (isOpen) {
      fetchFacets()
    }
  }, [isOpen, tempFilters])
  
  const fetchFacets = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(tempFilters).forEach(([key, value]) => {
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
  
  const applyFilters = () => {
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
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','))
        } else if (!Array.isArray(value)) {
          params.set(key, String(value))
        }
      }
    })
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setFilters(tempFilters)
    setIsOpen(false)
    onFilterChange?.(tempFilters)
  }
  
  const clearAllFilters = () => {
    setTempFilters({})
  }
  
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category && Array.isArray(filters.category)) count += filters.category.length
    if (filters.price_min || filters.price_max) count++
    if (filters.in_stock) count++
    if (filters.voltage && Array.isArray(filters.voltage)) count += filters.voltage.length
    if (filters.rating_min) count++
    return count
  }
  
  const activeCount = getActiveFilterCount()
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`relative ${className}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeCount > 0 && (
            <Badge 
              className="ml-2 bg-orange-600 text-white"
              variant="default"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Filters</DialogTitle>
            {Object.keys(tempFilters).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-orange-600 hover:text-orange-700"
              >
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-0 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Price Range Filter */}
          <FilterGroup title="Price Range" defaultExpanded>
            <PriceRangeSlider
              min={priceRange.min}
              max={priceRange.max}
              currentMin={tempFilters.price_min}
              currentMax={tempFilters.price_max}
              onChange={(min, max) => {
                setTempFilters({
                  ...tempFilters,
                  price_min: min !== priceRange.min ? min : undefined,
                  price_max: max !== priceRange.max ? max : undefined
                })
              }}
            />
          </FilterGroup>

          {/* Category Filter */}
          {facets?.categories && facets.categories.length > 0 && (
            <FilterGroup title="Categories">
              <CheckboxFilter
                options={facets.categories.map((c: any) => ({
                  value: c.value,
                  label: c.label,
                  count: c.count
                }))}
                selectedValues={(tempFilters.category as string[]) || []}
                onChange={(values) => {
                  setTempFilters({
                    ...tempFilters,
                    category: values.length > 0 ? values : undefined
                  })
                }}
              />
            </FilterGroup>
          )}

          {/* Stock Availability Filter */}
          {facets?.stock && (
            <FilterGroup title="Availability">
              <StockFilter
                selectedValue={
                  tempFilters.in_stock ? 'in_stock' : 
                  tempFilters.out_of_stock ? 'out_of_stock' : 'all'
                }
                onChange={(value) => {
                  setTempFilters({
                    ...tempFilters,
                    in_stock: value === 'in_stock' ? true : undefined,
                    out_of_stock: value === 'out_of_stock' ? true : undefined
                  })
                }}
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
                selectedValues={(tempFilters.voltage as string[]) || []}
                onChange={(values) => {
                  setTempFilters({
                    ...tempFilters,
                    voltage: values.length > 0 ? values : undefined
                  })
                }}
              />
            </FilterGroup>
          )}

          {/* Rating Filter */}
          {facets?.rating && facets.rating.length > 0 && (
            <FilterGroup title="Customer Rating">
              <RatingFilter
                selectedRating={tempFilters.rating_min}
                onChange={(rating) => {
                  setTempFilters({
                    ...tempFilters,
                    rating_min: rating
                  })
                }}
                counts={facets.rating.reduce((acc: any, r: any) => {
                  acc[r.value] = r.count
                  return acc
                }, {})}
              />
            </FilterGroup>
          )}
        </div>
        
        <DialogFooter className="px-6 py-4 border-t border-gray-200 flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={applyFilters}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
