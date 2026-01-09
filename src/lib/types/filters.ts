/**
 * Filter Types for Cedar Elevators Store
 */

// Catalog Filters (Structural Navigation)
export interface CatalogFilters {
    applications?: string[]      // Application IDs
    elevatorTypes?: string[]      // Elevator Type IDs
    categories?: string[]         // Category IDs
    subcategories?: string[]      // Subcategory IDs
}

// PLP Filters (Product Refinement)
export interface PLPFilters {
    availability?: 'in_stock' | 'out_of_stock' | 'made_to_order'
    priceRange?: { min: number; max: number }
    minRating?: number
    variantOptions?: Record<string, string[]> // {Size: ['L', 'XL'], Color: ['Red']}
    sort?: 'default' | 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity'
}

// Combined Store Filters
export interface StoreFilters {
    catalog: CatalogFilters
    plp: PLPFilters
    page?: number
    limit?: number
}

// Filter Option (for UI)
export interface FilterOption {
    id: string
    name: string
    count?: number
}

// Available Filter Options (from API)
export interface AvailableCatalogOptions {
    applications: FilterOption[]
    elevatorTypes: FilterOption[]
    categories: FilterOption[]
    subcategories: FilterOption[]
}

export interface AvailablePLPOptions {
    priceRange: { min: number; max: number }
    variantOptions: Record<string, string[]> // Category-scoped dynamic options
    ratings: number[]
}
