'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface SearchResult {
    id: string
    name: string
    slug: string
    sku: string | null
    category: string | null
    price: number | null
    compare_at_price: number | null
    thumbnail_url: string | null
    short_description: string | null
    tags: string[] | null
    rank: number
}

export interface SearchResponse {
    products: SearchResult[]
    total: number
    hasMore: boolean
    query: string
}

export interface SearchSuggestion {
    id: string
    name: string
    slug: string
    sku: string | null
    category: string | null
    price: number | null
    thumbnail_url: string | null
}

/**
 * Search products using PostgreSQL full-text search
 */
export async function searchProducts(
    query: string,
    options: {
        limit?: number
        offset?: number
        category?: string
        minPrice?: number
        maxPrice?: number
    } = {}
): Promise<SearchResponse> {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
        console.error('Search error: Supabase client not available')
        return {
            products: [],
            total: 0,
            hasMore: false,
            query
        }
    }

    const {
        limit = 24,
        offset = 0,
        category,
        minPrice,
        maxPrice
    } = options

    const { data, error } = await supabase.rpc('search_products', {
        search_query: query || '',
        result_limit: limit,
        result_offset: offset,
        category_filter: category || null,
        min_price: minPrice || null,
        max_price: maxPrice || null
    })

    if (error) {
        console.error('Search error:', error)
        return {
            products: [],
            total: 0,
            hasMore: false,
            query
        }
    }

    const products = (data || []) as SearchResult[]
    const total = products.length > 0 ? (products[0] as any).total_count : 0

    return {
        products,
        total: Number(total),
        hasMore: offset + products.length < Number(total),
        query
    }
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(
    query: string,
    limit: number = 8
): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) {
        return []
    }

    const supabase = createServerSupabaseClient()

    if (!supabase) {
        console.error('Suggestions error: Supabase client not available')
        return []
    }

    const { data, error } = await supabase.rpc('get_search_suggestions', {
        search_query: query,
        result_limit: limit
    })

    if (error) {
        console.error('Suggestions error:', error)
        return []
    }

    return (data || []) as SearchSuggestion[]
}

/**
 * Get popular search terms (static for now, can be dynamic later)
 */
export async function getPopularSearchTerms(): Promise<string[]> {
    return [
        'Control Panel',
        'Door Operator',
        'ARD System',
        'Safety Sensor',
        'Guide Rails',
        'Limit Switch'
    ]
}
