'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Collection, CollectionWithProducts } from '@/lib/types/collections'

export type DisplayContext = 'homepage' | 'categories' | 'business_hub'

/**
 * Get collections by display context
 * - homepage: Returns normal collections
 * - categories: Returns special collections with 'categories' in special_locations
 * - business_hub: Returns special collections with 'business_hub' in special_locations
 */
export async function getCollectionsByDisplayContext(
    context: DisplayContext
): Promise<{ success: boolean; collections: Collection[]; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            return { success: false, collections: [], error: 'Failed to create Supabase client' }
        }

        let query = supabase
            .from('collections')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

        // Apply context-specific filters
        if (context === 'homepage') {
            // Homepage: only normal collections
            query = query.eq('display_type', 'normal')
        } else if (context === 'categories') {
            // Categories tab: special collections with 'categories' in special_locations
            query = query
                .eq('display_type', 'special')
                .contains('special_locations', ['categories'])
        } else if (context === 'business_hub') {
            // Business Hub: special collections with 'business_hub' in special_locations
            query = query
                .eq('display_type', 'special')
                .contains('special_locations', ['business_hub'])
        }

        const { data, error } = await query

        if (error) {
            console.error(`Error fetching collections for ${context}:`, error)
            return { success: false, collections: [], error: error.message }
        }

        return { success: true, collections: data || [] }
    } catch (error: any) {
        console.error('Error in getCollectionsByDisplayContext:', error)
        return { success: false, collections: [], error: error.message || 'Unknown error' }
    }
}

/**
 * Get collections with products by display context
 */
export async function getCollectionsWithProductsByDisplayContext(
    context: DisplayContext,
    limit?: number
): Promise<{ success: boolean; collections: CollectionWithProducts[]; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            return { success: false, collections: [], error: 'Failed to create Supabase client' }
        }

        // First get collections by context
        const { success, collections, error } = await getCollectionsByDisplayContext(context)

        if (!success || !collections) {
            return { success: false, collections: [], error }
        }

        // Apply limit if specified
        const limitedCollections = limit ? collections.slice(0, limit) : collections

        // Fetch products for each collection
        const collectionsWithProducts = await Promise.all(
            limitedCollections.map(async (collection) => {
                const { data: collectionProducts } = await supabase
                    .from('collection_products')
                    .select(`
                        id,
                        product_id,
                        collection_id,
                        position,
                        created_at,
                        product:products (
                            id,
                            name,
                            slug,
                            thumbnail_url,
                            price,
                            status
                        )
                    `)
                    .eq('collection_id', collection.id)
                    .order('position', { ascending: true })
                    .limit(20) // Limit products per collection

                // Map the response to match ProductInCollection type
                const products = (collectionProducts || []).map((cp: any) => ({
                    id: cp.id,
                    product_id: cp.product_id,
                    collection_id: cp.collection_id,
                    position: cp.position,
                    created_at: cp.created_at,
                    product: Array.isArray(cp.product) ? cp.product[0] : cp.product
                }))

                return {
                    ...collection,
                    product_count: products.length,
                    products
                } as unknown as CollectionWithProducts
            })
        )

        return { success: true, collections: collectionsWithProducts }
    } catch (error: any) {
        console.error('Error in getCollectionsWithProductsByDisplayContext:', error)
        return { success: false, collections: [], error: error.message || 'Unknown error' }
    }
}
