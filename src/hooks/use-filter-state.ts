/**
 * Custom hook for managing filter state with URL synchronization
 * Provides centralized filter management across catalog pages
 */

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { FilterParams } from '@/lib/services/filterService'
import { useDebounce } from './useDebounce'

export function useFilterState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<FilterParams>({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Parse filters from URL on mount and URL changes
  useEffect(() => {
    const parsedFilters = parseFiltersFromURL(searchParams)
    setFilters(parsedFilters)
  }, [searchParams])
  
  // Debounced filter update (for price range sliders)
  const debouncedFilters = useDebounce(filters, 500)
  
  /**
   * Update filters and sync to URL
   */
  const updateFilters = useCallback((newFilters: Partial<FilterParams>) => {
    setIsLoading(true)
    const updatedFilters = { ...filters, ...newFilters }
    
    // Remove undefined/null values
    Object.keys(updatedFilters).forEach(key => {
      const value = updatedFilters[key as keyof FilterParams]
      if (value === undefined || value === null || 
          (Array.isArray(value) && value.length === 0)) {
        delete updatedFilters[key as keyof FilterParams]
      }
    })
    
    setFilters(updatedFilters)
    syncFiltersToURL(updatedFilters)
    setIsLoading(false)
  }, [filters, pathname, router, searchParams])
  
  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({})
    syncFiltersToURL({})
  }, [pathname, router, searchParams])
  
  /**
   * Remove a specific filter
   */
  const removeFilter = useCallback((key: string, value?: any) => {
    const newFilters = { ...filters }
    
    if (value !== undefined && Array.isArray(newFilters[key as keyof FilterParams])) {
      // Remove specific value from array
      const arrayValue = newFilters[key as keyof FilterParams] as string[]
      newFilters[key as keyof FilterParams] = arrayValue.filter(v => v !== value) as any
      
      if ((newFilters[key as keyof FilterParams] as string[]).length === 0) {
        delete newFilters[key as keyof FilterParams]
      }
    } else {
      // Remove entire filter
      delete newFilters[key as keyof FilterParams]
      
      // Handle related filters
      if (key === 'price') {
        delete newFilters.price_min
        delete newFilters.price_max
      } else if (key === 'stock') {
        delete newFilters.in_stock
        delete newFilters.out_of_stock
      } else if (key === 'load_capacity') {
        delete newFilters.load_capacity_min
        delete newFilters.load_capacity_max
      } else if (key === 'speed') {
        delete newFilters.speed_min
        delete newFilters.speed_max
      }
    }
    
    setFilters(newFilters)
    syncFiltersToURL(newFilters)
  }, [filters, pathname, router, searchParams])
  
  /**
   * Sync filters to URL
   */
  const syncFiltersToURL = useCallback((filtersToSync: FilterParams) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Remove all filter params
    const filterKeys = [
      'category', 'application', 'app',
      'price_min', 'price_max',
      'in_stock', 'out_of_stock',
      'voltage', 'load_capacity_min', 'load_capacity_max',
      'speed_min', 'speed_max', 'rating_min'
    ]
    filterKeys.forEach(key => params.delete(key))
    
    // Add active filters
    Object.entries(filtersToSync).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','))
        } else if (!Array.isArray(value)) {
          params.set(key, String(value))
        }
      }
    })
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    // Update URL without scroll
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])
  
  /**
   * Get active filter count
   */
  const getActiveFilterCount = useCallback(() => {
    let count = 0
    
    if (filters.category) count += Array.isArray(filters.category) ? filters.category.length : 1
    if (filters.application) count += Array.isArray(filters.application) ? filters.application.length : 1
    if (filters.price_min || filters.price_max) count++
    if (filters.in_stock || filters.out_of_stock) count++
    if (filters.voltage) count += Array.isArray(filters.voltage) ? filters.voltage.length : 1
    if (filters.load_capacity_min || filters.load_capacity_max) count++
    if (filters.speed_min || filters.speed_max) count++
    if (filters.rating_min) count++
    
    return count
  }, [filters])
  
  /**
   * Check if any filters are active
   */
  const hasActiveFilters = getActiveFilterCount() > 0
  
  return {
    filters,
    debouncedFilters,
    isLoading,
    updateFilters,
    clearFilters,
    removeFilter,
    getActiveFilterCount,
    hasActiveFilters,
  }
}

/**
 * Parse filters from URL search params
 */
function parseFiltersFromURL(searchParams: URLSearchParams): FilterParams {
  const filters: FilterParams = {}
  
  // Category
  const category = searchParams.get('category')
  if (category) filters.category = category.split(',')
  
  // Application
  const application = searchParams.get('application') || searchParams.get('app')
  if (application) filters.application = application.split(',')
  
  // Price
  const priceMin = searchParams.get('price_min')
  const priceMax = searchParams.get('price_max')
  if (priceMin) filters.price_min = parseFloat(priceMin)
  if (priceMax) filters.price_max = parseFloat(priceMax)
  
  // Stock
  if (searchParams.get('in_stock') === 'true') filters.in_stock = true
  if (searchParams.get('out_of_stock') === 'true') filters.out_of_stock = true
  
  // Voltage
  const voltage = searchParams.get('voltage')
  if (voltage) filters.voltage = voltage.split(',')
  
  // Load capacity
  const loadCapMin = searchParams.get('load_capacity_min')
  const loadCapMax = searchParams.get('load_capacity_max')
  if (loadCapMin) filters.load_capacity_min = parseFloat(loadCapMin)
  if (loadCapMax) filters.load_capacity_max = parseFloat(loadCapMax)
  
  // Speed
  const speedMin = searchParams.get('speed_min')
  const speedMax = searchParams.get('speed_max')
  if (speedMin) filters.speed_min = parseFloat(speedMin)
  if (speedMax) filters.speed_max = parseFloat(speedMax)
  
  // Rating
  const rating = searchParams.get('rating_min')
  if (rating) filters.rating_min = parseFloat(rating)
  
  // Sort
  const sort = searchParams.get('sort')
  if (sort) filters.sort = sort as FilterParams['sort']
  
  // Pagination
  const page = searchParams.get('page')
  if (page) filters.page = parseInt(page, 10)
  
  const limit = searchParams.get('limit')
  if (limit) filters.limit = parseInt(limit, 10)
  
  // Search
  const q = searchParams.get('q')
  if (q) filters.q = q
  
  return filters
}

