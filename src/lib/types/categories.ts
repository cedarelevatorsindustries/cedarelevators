// =============================================
// Categories Types for Cedar Elevators
// 3-Layer Architecture: Application > Categories > Subcategories
// =============================================

export type CategoryStatus = 'active' | 'inactive'
export type CategoryLevel = 'application' | 'category' | 'subcategory' | 'elevator-type'

export interface Category {
    id: string
    name: string
    slug: string
    handle?: string | null // Database column for URL handle
    description?: string | null
    subtitle?: string | null
    parent_id?: string | null // NULL = Application, NOT NULL = Category/Subcategory
    // Visual Identity
    thumbnail?: string | null // Database column name for thumbnail
    thumbnail_image?: string | null // Square/card image for category cards, grids, filters
    banner_url?: string | null // Wide banner for category PLP header (database column)
    banner_image?: string | null // DEPRECATED: Use banner_url instead
    icon?: string | null
    // Badge
    badge_text?: string | null
    badge_color?: string | null
    // Display Rules
    card_position?: string | null
    default_sort?: string | null
    rank?: number | null // Database column for sort order
    sort_order: number
    is_active: boolean
    status: CategoryStatus
    visibility?: string | null
    // Metadata
    metadata?: Record<string, any> | null // JSONB column in database
    // ❌ REMOVED: application field - now handled via application_categories junction table
    seo_meta_title?: string | null
    seo_meta_description?: string | null
    created_at: string
    updated_at: string
    created_by?: string | null
}

export interface CategoryWithChildren extends Category {
    children?: CategoryWithChildren[]
    product_count?: number
    level?: CategoryLevel
}

export interface CategoryFormData {
    name: string
    slug: string
    description?: string
    subtitle?: string
    parent_id?: string | null
    // Visual Identity
    thumbnail_image?: string // Square/card image
    banner_url?: string // Wide banner for PLP header (matches DB column)
    icon?: string
    // Badge
    badge_text?: string
    badge_color?: string
    // Display Rules
    card_position?: string
    default_sort?: string
    sort_order?: number
    is_active?: boolean
    status?: CategoryStatus
    visibility?: string
    // ❌ REMOVED: application field - categories are global
    seo_meta_title?: string
    seo_meta_description?: string
}

export interface CategoryFilters {
    parent_id?: string | null
    application?: string
    status?: 'active' | 'inactive' | 'draft' | 'archived'
    is_active?: boolean
    search?: string
    level?: CategoryLevel
    // Pagination
    page?: number
    limit?: number
}

export interface CategoryStats {
    total: number
    active: number
    applications: number // Top-level categories
    categories: number // Mid-level
    subcategories: number // Bottom-level
    total_products: number
}

export interface CategoryHierarchy {
    application?: Category
    category?: Category
    subcategory?: Category
}

// Helper to determine category level
export function getCategoryLevel(category: Category): CategoryLevel {
    if (!category.parent_id) {
        return 'application'
    }
    // Would need to check if parent is an application to determine if this is category or subcategory
    // This requires fetching parent data, so we'll handle it in the server actions
    return 'category' // Default
}

// Helper to build category breadcrumb
export function buildCategoryBreadcrumb(hierarchy: CategoryHierarchy): string[] {
    const breadcrumb: string[] = []
    if (hierarchy.application) breadcrumb.push(hierarchy.application.name)
    if (hierarchy.category) breadcrumb.push(hierarchy.category.name)
    if (hierarchy.subcategory) breadcrumb.push(hierarchy.subcategory.name)
    return breadcrumb
}

