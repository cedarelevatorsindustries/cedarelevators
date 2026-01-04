'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { CMSDocument, SearchDocumentsParams, DocumentType } from '@/lib/types/documents'

export interface ServiceResult<T> {
    success: boolean
    data?: T
    error?: string
}

/**
 * Search documents (manuals, guides)
 */
export async function searchDocuments({
    query,
    type,
    category,
    productId
}: SearchDocumentsParams): Promise<ServiceResult<CMSDocument[]>> {
    try {
        const supabase = await createServerSupabase()

        let queryBuilder = supabase
            .from('documents')
            .select('*')
            .order('updated_at', { ascending: false })

        if (type) {
            queryBuilder = queryBuilder.eq('type', type)
        }

        if (category) {
            queryBuilder = queryBuilder.eq('category', category)
        }

        if (productId) {
            queryBuilder = queryBuilder.eq('product_id', productId)
        }

        if (query) {
            // Simple ilike search on title
            // For more advanced search, we'd need Full Text Search (fts) setup in DB
            queryBuilder = queryBuilder.ilike('title', `%${query}%`)
        }

        const { data, error } = await queryBuilder

        if (error) {
            console.error('Error searching documents:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data || [] }
    } catch (error) {
        console.error('Error in searchDocuments:', error)
        return { success: false, error: 'Failed to search documents' }
    }
}

