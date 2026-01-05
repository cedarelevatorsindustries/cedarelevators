// CSV Bulk Import Type Definitions (Name-Based)

// =============================================
// CSV ROW STRUCTURE (HUMAN-FRIENDLY)
// =============================================

export interface CSVRow {
    // Product-level fields
    title: string
    description: string
    short_description?: string
    image?: string // URL
    tags?: string // Comma-separated

    // Pricing
    base_price: string
    compare_price?: string
    cost_per_item?: string

    // Inventory
    stock_quantity: string
    low_stock_threshold?: string
    allow_backorder?: string // "TRUE"/"FALSE"

    // Variant fields (one row = one variant)
    variant_title?: string
    variant_option_1?: string
    variant_option_1_value?: string
    variant_option_2?: string
    variant_option_2_value?: string
    variant_price?: string // Falls back to base_price
    variant_stock?: string // Falls back to stock_quantity

    // Classification (HUMAN-READABLE NAMES, comma-separated)
    applications?: string // e.g., "Commercial Elevators, Residential"
    categories?: string // e.g., "Motors, Controllers"
    subcategories?: string // e.g., "Gearless, PMSM"
    types?: string // e.g., "Passenger, Freight"
    collections?: string // e.g., "Best Sellers, New Arrivals"

    // Attributes (JSON format)
    attributes?: string // e.g., "{\"power\":\"10HP\",\"voltage\":\"440V\"}"

    // Status (at the end)
    status?: 'draft' | 'active' | 'archived'
}

// =============================================
// PARSED & NORMALIZED DATA
// =============================================

export interface ProductGroup {
    // Product data
    title: string
    description: string
    short_description: string
    status: 'draft' | 'active' | 'archived'
    image_url?: string
    tags: string[]

    // Pricing
    base_price: number
    compare_price?: number
    cost_per_item?: number

    // Inventory
    stock_quantity: number
    low_stock_threshold: number
    allow_backorder: boolean

    // Resolved catalog IDs
    application_ids: string[]
    category_ids: string[]
    subcategory_ids: string[]
    type_ids: string[]
    collection_ids: string[]

    // Attributes
    attributes: Record<string, string>

    // Variants
    variants: ProductVariant[]

    // Auto-generated
    sku: string
    meta_title: string
    meta_description: string
    slug: string
}

export interface ProductVariant {
    title: string
    price: number
    stock: number
    sku: string
    option1_name?: string
    option1_value?: string
    option2_name?: string
    option2_value?: string
    option3_name?: string
    option3_value?: string
}

// =============================================
// CATALOG RESOLUTION
// =============================================

export interface CatalogLookupMaps {
    applications: Map<string, string> // normalized_name -> id
    categories: Map<string, string>
    subcategories: Map<string, string>
    types: Map<string, string>
    collections: Map<string, string>
}

export interface ResolvedCatalogNames {
    application_ids: string[]
    category_ids: string[]
    subcategory_ids: string[]
    type_ids: string[]
    collection_ids: string[]
    errors: ValidationError[]
    warnings: ValidationError[]
}

// =============================================
// VALIDATION
// =============================================

export interface ValidationError {
    row?: number
    field?: string
    message: string
    severity: 'error' | 'warning'
    code?: string // For programmatic error handling
}

export interface ValidationResult {
    valid: boolean
    blockingErrors: ValidationError[] // Must fix
    warnings: ValidationError[] // Can proceed as draft
    productGroups: ProductGroup[]
}

// =============================================
// PREVIEW RESULTS
// =============================================

export interface PreviewResult {
    success: boolean
    productGroups: ProductGroup[]
    blockingErrors: ValidationError[]
    warnings: ValidationError[]
    totalProducts: number
    totalVariants: number
    summary: PreviewSummary
}

export interface PreviewSummary {
    productsToCreate: number
    variantsToCreate: number
    applicationsAssigned: number
    categoriesAssigned: number
    subcategoriesAssigned: number
    typesAssigned: number
    collectionsAssigned: number
    drafts: number
    active: number
}

// =============================================
// IMPORT RESULTS
// =============================================

export interface ImportResult {
    success: boolean
    productsCreated: number
    variantsCreated: number
    productsUpdated: number
    errors?: ImportError[]
    duration?: number
}

export interface ImportError {
    productTitle: string
    variantSku?: string
    message: string
    details?: string
}

// =============================================
// NORMALIZATION UTILITIES
// =============================================

export interface NormalizedCSVRow extends CSVRow {
    _normalized: {
        applications: string[]
        categories: string[]
        subcategories: string[]
        types: string[]
        collections: string[]
        tags: string[]
        attributes: Record<string, string>
    }
}

