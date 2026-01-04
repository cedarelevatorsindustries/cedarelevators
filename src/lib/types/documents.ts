export type DocumentType = 'manual' | 'installation_guide'

export interface CMSDocument {
    id: string
    title: string
    product_id?: string
    category?: string
    type: DocumentType
    file_url: string
    version?: string
    updated_at: string
}

export interface SearchDocumentsParams {
    query?: string
    type?: DocumentType
    category?: string
    productId?: string
}

