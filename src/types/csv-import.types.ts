/**
 * CSV Import Types
 * Type definitions for CSV import functionality
 */

export interface ValidationError {
    row: number
    field: string
    message: string
    details?: string
}

export interface ProductVariant {
    title: string
    sku: string
    price: number
    mrp?: number
    compare_at_price?: number
    stock?: number
    barcode?: string
    weight?: number
    options?: Record<string, string>
}

export interface ProductGroup {
    handle: string
    title: string
    description?: string
    status?: 'draft' | 'published'
    variants: ProductVariant[]
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
    productHandle: string
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
