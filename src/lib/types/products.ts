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
    isPrimary?: boolean // Frontend compatibility
    sort_order: number
    public_id?: string
    base64?: string // For deferred upload
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

    // Cedar-specific technical fields (Phase 3)
    technical_specs?: Record<string, any> // Additional technical specifications as JSON

    status: ProductStatus
    thumbnail_url?: string
    images: ProductImage[]
    price?: number
    compare_at_price?: number
    cost_per_item?: number
    stock_quantity: number
    track_inventory: boolean
    allow_backorders: boolean
    low_stock_threshold: number
    bulk_pricing_available: boolean
    bulk_pricing_note?: string
    taxable: boolean
    sku?: string
    barcode?: string
    specifications?: ProductSpecification[]
    meta_title?: string
    meta_description?: string
    tags?: string[]
    created_at: string
    updated_at: string
}

// Flattened/Extended Product for UI
export interface ProductWithDetails extends Product {
    // Legacy
    category_name?: string

    // New hierarchy details
    application_name?: string
    category_name_new?: string
    subcategory_name?: string
    elevator_types?: Array<{ id: string; name: string }>
    collections?: Array<{ id: string; title: string }>
    product_variants?: ProductVariant[]
}

// Form Data for Create/Update
export interface ProductFormData {
    name: string
    slug: string
    description?: string
    short_description?: string

    // Legacy (deprecated)
    category?: string

    // Relationship fields - supports both single (deprecated) and multi-entity (new)
    application_id?: string // Deprecated - use application_ids instead
    category_id?: string // Deprecated - use category_ids instead
    subcategory_id?: string // Deprecated - use subcategory_ids instead

    // New multi-entity relationship fields
    application_ids?: string[] // Multi-select applications
    category_ids?: string[] // Multi-select categories
    subcategory_ids?: string[] // Multi-select subcategories
    elevator_type_ids?: string[] // Multi-select elevator types
    collection_ids?: string[] // Multi-select collections (optional)

    // New fields
    technical_specs?: Record<string, any>
    thumbnail_url?: string
    tags?: string[]
    images?: ProductImage[] // For simpler handling in frontend
    variants?: any[] // For simpler handling in frontend

    status: ProductStatus
    price: number
    compare_at_price?: number
    cost_per_item?: number
    stock_quantity: number
    track_inventory: boolean
    allow_backorders: boolean
    low_stock_threshold: number
    bulk_pricing_available: boolean
    bulk_pricing_note?: string
    taxable: boolean
    sku?: string
    barcode?: string
    specifications: ProductSpecification[]
    meta_title?: string
    meta_description?: string
}

export interface ProductFilters {
    search?: string
    status?: ProductStatus | 'all'
    category?: string
    is_featured?: boolean
    min_price?: number
    max_price?: number
    page?: number
    limit?: number
}

// Product Variant
export interface ProductVariant {
    id: string
    product_id: string
    name: string
    sku: string
    price: number
    compare_at_price?: number
    cost_per_item?: number
    inventory_quantity: number
    status: ProductStatus
    barcode?: string
    weight?: number
    image_url?: string
    option1_name?: string
    option1_value?: string
    option2_name?: string
    option2_value?: string
    option3_name?: string
    option3_value?: string
}

export interface ProductStats {
    total: number
    active: number
    draft: number
    archived: number
    out_of_stock: number
    low_stock: number
}

