/**
 * CSV Import Types
 * Type definitions for CSV import functionality
 */

export interface ValidationError {
    row: number
    field: string
    message: string
    details?: string
    severity: 'error' | 'warning' // error = blocking, warning = non-blocking
}

// Raw CSV row as parsed from file
export interface CSVRow {
    // Product-level fields
    product_title: string
    short_description: string
    brief_description?: string
    application_slug: string
    category_slug: string
    subcategory_slug?: string
    elevator_types?: string // comma-separated slugs
    collections?: string // comma-separated slugs
    product_price: string
    product_mrp: string // maps to compare_at_price
    track_inventory?: string // 'true' or 'false'
    product_stock: string
    status?: string // 'draft' or 'active'
    
    // Variant-level fields
    variant_title?: string
    variant_option_1_name?: string
    variant_option_1_value?: string
    variant_option_2_name?: string
    variant_option_2_value?: string
    variant_price?: string
    variant_mrp?: string // maps to compare_at_price
    variant_stock?: string
    
    // Metadata
    attributes?: string // JSON string
}

export interface ProductVariant {
    title: string
    sku: string
    price: number
    compare_at_price?: number // This is MRP
    stock: number
    barcode?: string
    weight?: number
    option1_name?: string
    option1_value?: string
    option2_name?: string
    option2_value?: string
    attributes?: Record<string, any>
}

export interface ProductGroup {
    // Product identification
    title: string
    slug: string
    
    // Product details
    description?: string
    short_description: string
    status: 'draft' | 'active'
    
    // Pricing & Inventory
    price: number
    compare_at_price?: number // This is MRP
    track_inventory: boolean
    stock_quantity: number
    
    // Catalog relationships (slugs from CSV)
    application_slug: string
    category_slug: string
    subcategory_slug?: string
    elevator_type_slugs: string[]
    collection_slugs: string[]
    
    // Resolved IDs (after validation)
    application_id?: string
    category_id?: string
    subcategory_id?: string
    elevator_type_ids?: string[]
    collection_ids?: string[]
    
    // Variants
    variants: ProductVariant[]
    
    // Validation results
    errors: ValidationError[]
    warnings: ValidationError[]
}

export interface PreviewResult {
    success: boolean
    totalProducts: number
    totalVariants: number
    productGroups: ProductGroup[]
    blockingErrors: ValidationError[]
    warnings: ValidationError[]
}

export interface ImportError {
    productTitle: string
    variantSku?: string
    message: string
    details?: string
}

export interface ImportResult {
    success: boolean
    duration: number
    productsCreated: number
    productsUpdated: number
    variantsCreated: number
    variantsUpdated: number
    failed: number
    errors?: ImportError[]
}

// Catalog entity lookup results
export interface CatalogLookupResult {
    application_id: string | null
    category_id: string | null
    subcategory_id: string | null
    elevator_type_ids: string[]
    collection_ids: string[]
    errors: ValidationError[]
}

