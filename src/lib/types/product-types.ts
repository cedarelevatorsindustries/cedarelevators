// =============================================
// Product-Type Junction Types
// Products can have MULTIPLE types (many-to-many)
// Types are FLAT classification tags
// =============================================

export interface ProductType {
    id: string
    product_id: string
    type_id: string
    created_at: string
}

export interface ProductTypeWithDetails extends ProductType {
    type?: {
        id: string
        name: string
        slug: string
        thumbnail_image?: string
    }
}

export interface CreateProductTypeData {
    product_id: string
    type_id: string
}

// Helper to manage product types
export interface ProductTypesUpdate {
    product_id: string
    type_ids: string[] // Array of type IDs to assign
}

