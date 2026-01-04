// =============================================
// Application-Category Link Types
// Applications LINK to global categories (curated view)
// =============================================

export interface ApplicationCategory {
    id: string
    application_id: string
    category_id: string
    sort_order: number
    created_at: string
    updated_at: string
}

export interface ApplicationCategoryWithDetails extends ApplicationCategory {
    category?: {
        id: string
        name: string
        slug: string
        thumbnail_image?: string
    }
}

export interface CreateApplicationCategoryData {
    application_id: string
    category_id: string
    sort_order?: number
}

export interface UpdateApplicationCategoryData {
    sort_order?: number
}

