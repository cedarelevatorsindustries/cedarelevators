"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface SearchResult {
    id: string
    name: string
    slug: string
    thumbnail_url: string | null
    price: number | null
    sku: string | null
    short_description: string | null
    category_name: string | null
    tags: string[]
    rank: number
}

export interface SearchResponse {
    success: boolean
    results: SearchResult[]
    total: number
    error?: string
}

/**
 * Search products using PostgreSQL full-text search
 * Searches across: name, description, short_description, SKU, and tags
 * 
 * @param query - Search query string
 * @param limit - Maximum number of results (default: 10 for autocomplete)
 * @param offset - Pagination offset (default: 0)
 */
export async function searchProducts(
    query: string,
    limit: number = 10,
    offset: number = 0
): Promise<SearchResponse> {
    try {
        if (!query || query.trim().length < 2) {
            return { success: true, results: [], total: 0 }
        }

        const supabase = createServerSupabaseClient()

        // Sanitize query for PostgreSQL full-text search
        // Replace spaces with & for AND operation, escape special characters
        const sanitizedQuery = query
            .trim()
            .split(/\s+/)
            .map(term => term.replace(/[^a-zA-Z0-9]/g, ''))
            .filter(term => term.length > 0)
            .join(' & ')

        if (!sanitizedQuery) {
            return { success: true, results: [], total: 0 }
        }

        // Use RPC function for complex full-text search with tags
        const { data, error } = await supabase.rpc('search_products_with_tags', {
            search_query: sanitizedQuery,
            result_limit: limit,
            result_offset: offset
        })

        if (error) {
            console.error('[searchProducts] Error:', error)

            // Fallback to simple ILIKE search if RPC function doesn't exist
            return await fallbackSearch(query, limit, offset)
        }

        const results: SearchResult[] = (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            thumbnail_url: row.thumbnail_url,
            price: row.price,
            sku: row.sku,
            short_description: row.short_description,
            category_name: row.category_name,
            tags: row.tags || [],
            rank: row.rank || 0
        }))

        return {
            success: true,
            results,
            total: results.length
        }
    } catch (error: any) {
        console.error('[searchProducts] Exception:', error)
        return {
            success: false,
            results: [],
            total: 0,
            error: error.message
        }
    }
}

/**
 * Fallback search using simple ILIKE pattern matching
 * Used when PostgreSQL full-text search function is not available
 */
async function fallbackSearch(
    query: string,
    limit: number,
    offset: number
): Promise<SearchResponse> {
    try {
        const supabase = createServerSupabaseClient()
        const searchPattern = `%${query}%`

        const { data: products, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                slug,
                thumbnail_url,
                price,
                sku,
                short_description,
                status
            `)
            .or(`name.ilike.${searchPattern},description.ilike.${searchPattern},sku.ilike.${searchPattern}`)
            .eq('status', 'active')
            .limit(limit)
            .range(offset, offset + limit - 1)

        if (error) throw error

        const results: SearchResult[] = (products || []).map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            thumbnail_url: p.thumbnail_url,
            price: p.price,
            sku: p.sku,
            short_description: p.short_description,
            category_name: null,
            tags: [],
            rank: 0
        }))

        return {
            success: true,
            results,
            total: results.length
        }
    } catch (error: any) {
        console.error('[fallbackSearch] Error:', error)
        return {
            success: false,
            results: [],
            total: 0,
            error: error.message
        }
    }
}
