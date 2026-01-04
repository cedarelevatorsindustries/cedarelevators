// =============================================
// Collections Types for Cedar Elevators
// =============================================

export type CollectionType = 'manual' | 'automatic'
export type CollectionStatus = 'active' | 'inactive'
export type CollectionContextType = 'general' | 'category_specific' | 'business_specific'
export type CollectionDisplayType = 'normal' | 'special'
export type SpecialCollectionLocation = 'categories' | 'business_hub'

export interface Collection {
    id: string
    title: string
    slug: string
    description?: string | null
    // Visual Identity
    image_url?: string | null // DEPRECATED: Use thumbnail_image instead
    thumbnail_image?: string | null // Square/card image for collection cards and grids
    banner_image?: string | null // Wide banner for collection PLP header (optional, non-clickable)
    image_alt?: string | null
    type: CollectionType
    rule_json?: any
    is_active: boolean
    is_featured: boolean
    sort_order: number
    meta_title?: string | null
    meta_description?: string | null
    // Context Fields (NEW)
    collection_type: CollectionContextType // general, category_specific, business_specific
    category_id?: string | null // For category_specific collections
    is_business_only: boolean // For business hub filtering
    display_order: number // Display order within context
    // Display Type System (NEW)
    display_type: CollectionDisplayType // normal (homepage) or special (categories/business_hub)
    special_locations: SpecialCollectionLocation[] // Where to show special collections
    // Display Configuration
    display_location?: string[] | null // Where to show: ["House", "catalog", "product"]
    layout?: string | null // grid-5, grid-4, grid-3, horizontal-scroll, special
    icon?: string | null // heart, trending, star, new, recommended, none
    show_view_all?: boolean | null
    view_all_link?: string | null
    empty_state_message?: string | null
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
    // Visual Identity
    image_url?: string // DEPRECATED: Use thumbnail_image instead
    thumbnail_image?: string // Square/card image
    banner_image?: string // Wide banner for PLP header
    image_alt?: string
    type?: CollectionType
    is_active?: boolean
    is_featured?: boolean
    sort_order?: number
    meta_title?: string
    meta_description?: string
    // Context Fields
    collection_type?: CollectionContextType
    category_id?: string
    is_business_only?: boolean
    display_order?: number
    // Display Type System
    display_type?: CollectionDisplayType
    special_locations?: SpecialCollectionLocation[]
    product_ids?: string[]
}

export interface CollectionFilters {
    type?: CollectionType
    is_active?: boolean
    is_featured?: boolean
    search?: string
    // Context Filters
    collection_type?: CollectionContextType
    category_id?: string
    is_business_only?: boolean
    limit?: number
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

