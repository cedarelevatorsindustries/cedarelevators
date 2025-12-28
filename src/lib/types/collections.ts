// =============================================
// Collections Types for Cedar Elevators
// =============================================

export type CollectionType = 'manual' | 'automatic'
export type CollectionStatus = 'active' | 'inactive'

export interface Collection {
    id: string
    title: string
    slug: string
    description?: string | null
    image_url?: string | null
    image_alt?: string | null
    type: CollectionType
    rule_json?: any
    is_active: boolean
    is_featured: boolean
    sort_order: number
    meta_title?: string | null
    meta_description?: string | null
    created_at: string
    updated_at: string
    created_by?: string | null
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
    image_url?: string
    image_alt?: string
    type?: CollectionType
    is_active?: boolean
    is_featured?: boolean
    sort_order?: number
    meta_title?: string
    meta_description?: string
    product_ids?: string[]
}

export interface CollectionFilters {
    type?: CollectionType
    is_active?: boolean
    is_featured?: boolean
    search?: string
}

export interface CollectionStats {
    total: number
    active: number
    featured: number
    total_products: number
}

// Helper to get collection status
export function getCollectionStatus(collection: Collection): CollectionStatus {
    return collection.is_active ? 'active' : 'inactive'
}

// Helper to generate slug from title
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}
