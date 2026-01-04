'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export interface StoreSearchFilters {
    query: string
    category_id?: string
    application_id?: string
    elevator_type_id?: string
    min_price?: number
    max_price?: number
    page?: number
    limit?: number
}

export interface StoreSearchResult {
    success: boolean
    products?: any[]
    total?: number
    page?: number
    limit?: number
    totalPages?: number
    error?: string
}

/**
 * Store full-text search with weighted ranking and exact SKU boost
 * 
 * Search strategy:
 * 1. Check for exact SKU match first (highest priority)
 * 2. Perform full-text search with ts_rank ordering
 * 3. Apply filters AFTER search (category, application, elevator type)
 * 4. Apply role-based visibility rules
 */
export async function storeSearch(filters: StoreSearchFilters): Promise<StoreSearchResult> {
    try {
        const supabase = await createServerSupabase()
        const { userId } = await auth()

        const page = filters.page || 1
        const limit = filters.limit || 24
        const searchQuery = filters.query?.trim()

        if (!searchQuery) {
            return { success: false, error: 'Search query is required' }
        }

        // =====================================================
        // STEP 1: Exact SKU Match Boost (Highest Priority)
        // =====================================================
        // If user searches for exact SKU, return it immediately

        const { data: exactSkuMatch } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .eq('is_categorized', true)
            .ilike('sku', searchQuery)
            .single()

        if (exactSkuMatch) {
            return {
                success: true,
                products: [exactSkuMatch],
                total: 1,
                page: 1,
                limit: 1,
                totalPages: 1
            }
        }

        // =====================================================
        // STEP 2: Full-Text Search with Ranking
        // =====================================================

        // Build the base query with full-text search
        let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('status', 'active')
            .eq('is_categorized', true)

        // Use RPC function for ranking

        const { data: searchResults, error: searchError, count } = await supabase
            .rpc('search_products', {
                search_query: searchQuery,
                category_filter: filters.category_id || null,
                application_filter: filters.application_id || null,
                elevator_type_filter: filters.elevator_type_id || null,
                page_number: page,
                page_size: limit
            })

        if (searchError) {
            console.error('Store search error:', searchError)
            return { success: false, error: searchError.message }
        }

        return {
            success: true,
            products: searchResults || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        }
    } catch (error: any) {
        console.error('Store search error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Search suggestions for autocomplete (fast, prefix-based)
 * 
 * Uses prefix search (:*) for fast autocomplete
 * Returns grouped results: products and categories
 */
export async function searchSuggestions(query: string) {
    try {
        if (!query || query.length < 2) {
            return { success: true, suggestions: { products: [], categories: [] } }
        }

        const supabase = await createServerSupabase()

        // =====================================================
        // Products Suggestions (Prefix Search)
        // =====================================================

        const { data: products } = await supabase
            .rpc('search_product_suggestions', {
                search_query: query
            })
            .limit(5)

        // =====================================================
        // Category Suggestions (Simple ILIKE)
        // =====================================================

        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, slug')
            .ilike('name', `%${query}%`)
            .eq('is_active', true)
            .limit(3)

        return {
            success: true,
            suggestions: {
                products: products || [],
                categories: categories || []
            }
        }
    } catch (error: any) {
        console.error('Search suggestions error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get search filters metadata (categories, applications, elevator types)
 * Used to populate filter dropdowns on search results page
 */
export async function getSearchFilters() {
    try {
        const supabase = await createServerSupabase()

        const [categories, applications, elevatorTypes] = await Promise.all([
            supabase
                .from('categories')
                .select('id, name, slug')
                .is('parent_id', null)
                .eq('is_active', true)
                .order('sort_order'),

            supabase
                .from('categories')
                .select('id, name, slug')
                .not('application', 'is', null)
                .eq('is_active', true)
                .order('sort_order'),

            supabase
                .from('elevator_types')
                .select('id, name, slug')
                .eq('is_active', true)
                .order('sort_order')
        ])

        return {
            success: true,
            filters: {
                categories: categories.data || [],
                applications: applications.data || [],
                elevatorTypes: elevatorTypes.data || []
            }
        }
    } catch (error: any) {
        console.error('Get search filters error:', error)
        return { success: false, error: error.message }
    }
}

