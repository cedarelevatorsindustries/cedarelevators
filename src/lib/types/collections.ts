// =============================================
// Collections Types for Cedar Elevators
// =============================================

export type CollectionStatus = 'active' | 'draft' | 'archived'
export type CollectionContextType = 'general' | 'category_specific' | 'business_specific'

export interface Collection {
    id: string
    title: string
    slug: string
    description?: string | null
    is_active: boolean
    status: CollectionStatus
    meta_title?: string | null
    meta_description?: string | null
    // Context Fields
    collection_type: CollectionContextType // general, category_specific, business_specific
    category_id?: string | null // For category_specific collections
    is_business_only: boolean // For business hub filtering
    display_order: number // Display order within context
    // Guest User Visibility
    show_in_guest: boolean
    created_at: string
    updated_at: string
    category?: {
        name: string
    }
}

export interface CollectionWithProducts extends Collection {
    product_count: number
    products?: ProductInCollection[]
}

export interface ProductInCollection {
    id: string
    product_id: string
    collection_id: string
    position: number
    created_at: string
    product?: {
        id: string
        name: string
        slug: string
        thumbnail?: string
        price?: number
        status?: string
    }
}

export interface CollectionFormData {
    title: string
    slug: string
    description?: string
    is_active?: boolean
    status: CollectionStatus
    meta_title?: string
    meta_description?: string
    // Context Fields
    collection_type?: CollectionContextType
    category_id?: string
    is_business_only?: boolean
    display_order?: number
    // Guest User Visibility
    show_in_guest?: boolean
    product_ids?: string[]
}


export interface CollectionFilters {
    is_active?: boolean
    search?: string
    // Context Filters
    collection_type?: CollectionContextType
    category_id?: string
    is_business_only?: boolean
    // Pagination
    page?: number
    limit?: number
}

export interface CollectionStats {
    total: number
    active: number
    total_products: number
}

// Helper to get collection status
export function getCollectionStatus(collection: Collection): CollectionStatus {
    return collection.is_active ? 'active' : 'draft'
}

// Helper to generate slug from title
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

