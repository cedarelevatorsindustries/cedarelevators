/**
 * Filter Service for Cedar Elevators Store
 * 
 * This service provides production-ready filtering capabilities:
 * - Composable query builder
 * - Faceted filtering with accurate counts
 * - Price range calculation
 * - URL parameter parsing
 * - PostgreSQL optimization with JSONB support
 */

import { SupabaseClient } from '@supabase/supabase-js'

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface FilterParams {
  // Category & Application
  category?: string | string[]
  application?: string | string[]

  // Price
  price_min?: number
  price_max?: number

  // Stock
  in_stock?: boolean
  out_of_stock?: boolean

  // Technical Specifications
  voltage?: string | string[]
  load_capacity_min?: number
  load_capacity_max?: number
  speed_min?: number
  speed_max?: number

  // Rating
  rating_min?: number // e.g., 4 means "4 stars and up"

  // Sorting
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'featured' | 'rating'

  // Pagination
  page?: number
  limit?: number

  // Search
  q?: string
}

export interface FilterState extends FilterParams {
  // Additional state for UI
  activeFilters: string[]
  hasFilters: boolean
}

export interface FacetCount {
  value: string | number
  label: string
  count: number
}

export interface FacetResults {
  categories: FacetCount[]
  applications: FacetCount[]
  voltage: FacetCount[]
  stock: { in_stock: number; out_of_stock: number }
  rating: FacetCount[]
  priceRange: { min: number; max: number }
}

export interface FilteredProductsResult {
  products: any[]
  total: number
  page: number
  limit: number
  totalPages: number
  facets?: FacetResults
}

// =====================================================
// FILTER SERVICE CLASS
// =====================================================

export class FilterService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Main method: Get filtered products with facet counts
   */
  async getFilteredProducts(
    filters: FilterParams,
    includeFacets: boolean = true
  ): Promise<FilteredProductsResult> {
    const page = filters.page || 1
    const limit = filters.limit || 24
    const offset = (page - 1) * limit

    // Build base query
    let query = this.supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('status', 'active')

    // Apply all filters
    query = this.applyFilters(query, filters)

    // Apply sorting
    query = this.applySorting(query, filters.sort)

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: products, error, count } = await query

    if (error) {
      console.error('Filter query error:', error)
      throw new Error(`Failed to fetch filtered products: ${error.message}`)
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    // Get facet counts if requested
    let facets: FacetResults | undefined
    if (includeFacets) {
      facets = await this.getFacetCounts(filters)
    }

    return {
      products: products || [],
      total,
      page,
      limit,
      totalPages,
      facets
    }
  }

  /**
   * Apply all filters to query
   */
  private applyFilters(query: any, filters: FilterParams): any {
    // Category filter
    if (filters.category) {
      const categories = Array.isArray(filters.category)
        ? filters.category
        : [filters.category]
      query = query.in('category', categories)
    }

    // Application filter (stored in metadata or separate field)
    if (filters.application) {
      const applications = Array.isArray(filters.application)
        ? filters.application
        : [filters.application]
      // Assuming application is stored in JSONB metadata
      applications.forEach(app => {
        query = query.or(`metadata->application.eq.${app}`)
      })
    }

    // Price range filter
    if (filters.price_min !== undefined) {
      query = query.gte('price', filters.price_min)
    }
    if (filters.price_max !== undefined) {
      query = query.lte('price', filters.price_max)
    }

    // Stock availability filter
    if (filters.in_stock) {
      query = query.gt('stock_quantity', 0)
    }
    if (filters.out_of_stock) {
      query = query.eq('stock_quantity', 0)
    }

    // Voltage filter
    if (filters.voltage) {
      const voltages = Array.isArray(filters.voltage)
        ? filters.voltage
        : [filters.voltage]
      query = query.in('voltage', voltages)
    }

    // Load capacity range filter
    if (filters.load_capacity_min !== undefined) {
      query = query.gte('load_capacity_kg', filters.load_capacity_min)
    }
    if (filters.load_capacity_max !== undefined) {
      query = query.lte('load_capacity_kg', filters.load_capacity_max)
    }

    // Speed range filter
    if (filters.speed_min !== undefined) {
      query = query.gte('speed_ms', filters.speed_min)
    }
    if (filters.speed_max !== undefined) {
      query = query.lte('speed_ms', filters.speed_max)
    }

    // Rating filter (e.g., rating_min=4 means 4 stars and up)
    if (filters.rating_min !== undefined) {
      query = query.gte('average_rating', filters.rating_min)
    }

    // Search filter
    if (filters.q) {
      const searchTerm = `%${filters.q}%`
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
    }

    return query
  }

  /**
   * Apply sorting to query
   */
  private applySorting(query: any, sort?: string): any {
    switch (sort) {
      case 'price_asc':
        return query.order('price', { ascending: true, nullsFirst: false })
      case 'price_desc':
        return query.order('price', { ascending: false, nullsFirst: false })
      case 'name_asc':
        return query.order('name', { ascending: true })
      case 'name_desc':
        return query.order('name', { ascending: false })
      case 'newest':
        return query.order('created_at', { ascending: false })
      case 'rating':
        return query.order('average_rating', { ascending: false, nullsFirst: false })
      case 'featured':
        return query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
      default:
        // Default: featured first, then newest
        return query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
    }
  }

  /**
   * Get facet counts for all filter dimensions
   */
  async getFacetCounts(filters: FilterParams): Promise<FacetResults> {
    // For facet counts, we need to apply all filters EXCEPT the one we're counting
    // This ensures accurate "available options" counts

    const [
      categories,
      applications,
      voltage,
      stock,
      rating,
      priceRange
    ] = await Promise.all([
      this.getCategoryFacets(filters),
      this.getApplicationFacets(filters),
      this.getVoltageFacets(filters),
      this.getStockFacets(filters),
      this.getRatingFacets(filters),
      this.getPriceRange(filters)
    ])

    return {
      categories,
      applications,
      voltage,
      stock,
      rating,
      priceRange
    }
  }

  /**
   * Get category facet counts
   */
  private async getCategoryFacets(filters: FilterParams): Promise<FacetCount[]> {
    // Apply all filters EXCEPT category
    const { category, ...otherFilters } = filters

    let query = this.supabase
      .from('products')
      .select('category')
      .eq('status', 'active')
      .not('category', 'is', null)

    query = this.applyFilters(query, otherFilters)

    const { data, error } = await query

    if (error || !data) return []

    // Count occurrences
    const counts = data.reduce((acc: Record<string, number>, item) => {
      const cat = item.category
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    // Convert to FacetCount array
    return Object.entries(counts).map(([value, count]) => ({
      value,
      label: value, // You might want to fetch actual category names
      count
    })).sort((a, b) => b.count - a.count)
  }

  /**
   * Get application facet counts
   */
  private async getApplicationFacets(filters: FilterParams): Promise<FacetCount[]> {
    // This is a simplified implementation
    // In production, you'd query based on actual application storage
    return []
  }

  /**
   * Get voltage facet counts
   */
  private async getVoltageFacets(filters: FilterParams): Promise<FacetCount[]> {
    const { voltage, ...otherFilters } = filters

    let query = this.supabase
      .from('products')
      .select('voltage')
      .eq('status', 'active')
      .not('voltage', 'is', null)

    query = this.applyFilters(query, otherFilters)

    const { data, error } = await query

    if (error || !data) return []

    // Count occurrences
    const counts = data.reduce((acc: Record<string, number>, item) => {
      const volt = item.voltage
      acc[volt] = (acc[volt] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([value, count]) => ({
      value,
      label: value,
      count
    })).sort((a, b) => {
      // Sort by voltage value numerically
      const aNum = parseInt(a.value.replace(/\D/g, ''))
      const bNum = parseInt(b.value.replace(/\D/g, ''))
      return aNum - bNum
    })
  }

  /**
   * Get stock availability facet counts
   */
  private async getStockFacets(filters: FilterParams): Promise<{ in_stock: number; out_of_stock: number }> {
    const { in_stock, out_of_stock, ...otherFilters } = filters

    let baseQuery = this.supabase
      .from('products')
      .select('stock_quantity', { count: 'exact', head: true })
      .eq('status', 'active')

    baseQuery = this.applyFilters(baseQuery, otherFilters)

    // Count in stock
    const { count: inStockCount } = await baseQuery.gt('stock_quantity', 0)

    // Count out of stock
    const { count: outOfStockCount } = await baseQuery.eq('stock_quantity', 0)

    return {
      in_stock: inStockCount || 0,
      out_of_stock: outOfStockCount || 0
    }
  }

  /**
   * Get rating facet counts
   */
  private async getRatingFacets(filters: FilterParams): Promise<FacetCount[]> {
    const { rating_min, ...otherFilters } = filters

    let query = this.supabase
      .from('products')
      .select('average_rating')
      .eq('status', 'active')
      .not('average_rating', 'is', null)
      .gt('average_rating', 0)

    query = this.applyFilters(query, otherFilters)

    const { data, error } = await query

    if (error || !data) return []

    // Group by rating floor (e.g., 4.5 → 4)
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    data.forEach(item => {
      const rating = Math.floor(item.average_rating)
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating as keyof typeof ratingCounts]++
      }
    })

    return Object.entries(ratingCounts)
      .map(([value, count]) => ({
        value: parseInt(value),
        label: `${value} Stars & Up`,
        count
      }))
      .filter(item => item.count > 0)
      .reverse() // 5 stars first
  }

  /**
   * Get price range (min/max) for current filter scope
   */
  async getPriceRange(filters: FilterParams): Promise<{ min: number; max: number }> {
    const { price_min, price_max, ...otherFilters } = filters

    let query = this.supabase
      .from('products')
      .select('price')
      .eq('status', 'active')
      .not('price', 'is', null)

    query = this.applyFilters(query, otherFilters)

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return { min: 0, max: 50000 }
    }

    const prices = data.map(p => parseFloat(p.price)).filter(p => !isNaN(p))

    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }
}

// =====================================================
// URL PARAMETER UTILITIES
// =====================================================

/**
 * Parse URL search params into FilterParams
 */
export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
  const filters: FilterParams = {}

  // Category
  const category = searchParams.get('category')
  if (category) {
    filters.category = category.includes(',') ? category.split(',') : category
  }

  // Application
  const application = searchParams.get('application') || searchParams.get('app')
  if (application) {
    filters.application = application.includes(',') ? application.split(',') : application
  }

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
  if (voltage) {
    filters.voltage = voltage.includes(',') ? voltage.split(',') : voltage
  }

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
  const ratingMin = searchParams.get('rating_min')
  if (ratingMin) filters.rating_min = parseFloat(ratingMin)

  // Sort
  const sort = searchParams.get('sort')
  if (sort) filters.sort = sort as any

  // Pagination
  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  if (page) filters.page = parseInt(page)
  if (limit) filters.limit = parseInt(limit)

  // Search
  const q = searchParams.get('q')
  if (q) filters.q = q

  return filters
}

/**
 * Convert FilterParams to URL search params string
 */
export function filtersToSearchParams(filters: FilterParams): string {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    if (Array.isArray(value)) {
      params.set(key, value.join(','))
    } else {
      params.set(key, String(value))
    }
  })

  return params.toString()
}

/**
 * Get active filter labels for display
 */
export function getActiveFilterLabels(filters: FilterParams): { key: string; label: string; value: any }[] {
  const labels: { key: string; label: string; value: any }[] = []

  if (filters.category) {
    const cats = Array.isArray(filters.category) ? filters.category : [filters.category]
    cats.forEach(cat => labels.push({ key: 'category', label: `Category: ${cat}`, value: cat }))
  }

  if (filters.price_min || filters.price_max) {
    const min = filters.price_min || 0
    const max = filters.price_max || '∞'
    labels.push({ key: 'price', label: `Price: ₹${min} - ₹${max}`, value: { min, max } })
  }

  if (filters.in_stock) {
    labels.push({ key: 'stock', label: 'In Stock Only', value: true })
  }

  if (filters.voltage) {
    const volts = Array.isArray(filters.voltage) ? filters.voltage : [filters.voltage]
    volts.forEach(v => labels.push({ key: 'voltage', label: `Voltage: ${v}`, value: v }))
  }

  if (filters.rating_min) {
    labels.push({ key: 'rating', label: `${filters.rating_min}+ Stars`, value: filters.rating_min })
  }

  return labels
}
