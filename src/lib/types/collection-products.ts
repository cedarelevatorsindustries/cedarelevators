// =============================================
// Collection-Product Junction Types
// Collections are MERCHANDISING tools where ORDER matters
// Products can be in MULTIPLE collections
// =============================================

export interface CollectionProduct {
    id: string
    collection_id: string
    product_id: string
    position: number
    created_at: string
}

export interface CollectionProductWithDetails extends CollectionProduct {
    product?: {
        id: string
        name: string
        slug: string
        thumbnail?: string
        price?: number
        status?: string
    }
}

export interface CreateCollectionProductData {
    collection_id: string
    product_id: string
    position?: number
}

export interface UpdateCollectionProductData {
    position?: number
}

export interface ReorderCollectionProductsData {
    collection_id: string
    product_orders: Array<{
        product_id: string
        position: number
    }>
}

