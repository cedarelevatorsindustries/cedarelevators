/**
 * Product Management Types for Cedar Elevators
 */

// Product Status
export type ProductStatus = 'draft' | 'active' | 'archived'

// Product Specification Item
export interface ProductSpecification {
    key: string
    value: string
}

// Product Dimensions
export interface ProductDimensions {
    length?: number
    width?: number
    height?: number
    unit: 'cm' | 'in' | 'mm'
}

// Product Image
export interface ProductImage {
    id: string
    url: string
    alt: string
    is_primary: boolean
    sort_order: number
}

// Product Entity from Database
export interface Product {
    id: string
    name: string
    slug: string
    description?: string
    short_description?: string
    
    // Legacy field (deprecated)
    category?: string // Can be UUID or text
    
    // New relationship fields (Cedar Interconnection Logic)
    application_id?: string
    category_id?: string
    subcategory_id?: string
    is_categorized: boolean
    
    status: ProductStatus
    thumbnail?: string
    images: ProductImage[]
    price?: number
    compare_at_price?: number
    cost_per_item?: number
    stock_quantity: number
    sku?: string
    barcode?: string
    weight?: number
    dimensions?: ProductDimensions
    specifications?: ProductSpecification[]
    tags?: string[]
    is_featured: boolean
    view_count: number
    created_at: string
    updated_at: string
}

// Flattened/Extended Product for UI
export interface ProductWithDetails extends Product {
    category_name?: string
}

// Form Data for Create/Update
export interface ProductFormData {
    name: string
    slug: string
    description?: string
    short_description?: string
    category?: string
    status: ProductStatus
    price: number
    compare_at_price?: number
    cost_per_item?: number
    stock_quantity: number
    sku?: string
    barcode?: string
    weight?: number
    dimensions: ProductDimensions
    specifications: ProductSpecification[]
    tags: string[]
    is_featured: boolean
    images: ProductImage[]
}

export interface ProductFilters {
    search?: string
    status?: ProductStatus
    category?: string
    is_featured?: boolean
    min_price?: number
    max_price?: number
}

export interface ProductStats {
    total: number
    active: number
    draft: number
    archived: number
    out_of_stock: number
    low_stock: number
}
