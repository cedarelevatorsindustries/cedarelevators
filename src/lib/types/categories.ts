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
    description?: string | null
    parent_id?: string | null
    image_url?: string | null
    image_alt?: string | null
    icon?: string | null
    sort_order: number
    is_active: boolean
    status: CategoryStatus
    application?: string | null // For top-level: residential, commercial, industrial
    meta_title?: string | null
    meta_description?: string | null
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
    parent_id?: string | null
    image_url?: string
    image_alt?: string
    icon?: string
    sort_order?: number
    is_active?: boolean
    status?: CategoryStatus
    application?: string
    meta_title?: string
    meta_description?: string
}

export interface CategoryFilters {
    parent_id?: string | null
    application?: string
    status?: CategoryStatus
    is_active?: boolean
    search?: string
    level?: CategoryLevel
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
