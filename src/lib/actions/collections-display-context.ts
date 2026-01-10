'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Collection, CollectionWithProducts } from '@/lib/types/collections'

export type DisplayContext = 'homepage' | 'categories' | 'business_hub'

/**
 * Get collections by display context
 * - homepage: Returns general collections
 * - categories: Returns category-specific collections
 * - business_hub: Returns business-specific collections
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
            .order('display_order', { ascending: true })

        // Apply context-specific filters using appropriate collection_type
        if (context === 'homepage') {
            // Homepage: general collections
            query = query.eq('collection_type', 'general')
        } else if (context === 'categories') {
            // Categories tab: category_specific collections
            query = query.eq('collection_type', 'category_specific')
        } else if (context === 'business_hub') {
            // Business Hub: business_specific collections
            query = query.eq('collection_type', 'business_specific')
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

        // Apply limit if specified (limit the number of collections?)
        // The limit param name is ambiguous here, typically means products per collection, but slicing logic suggested collections.
        // Given usage in page.tsx was implicit, let's assume it filters collections if any.
        const limitedCollections = limit ? collections.slice(0, limit) : collections

        // Fetch products for each collection
        const collectionsWithProducts = await Promise.all(
            limitedCollections.map(async (collection) => {
                const { data: collectionProducts } = await supabase
                    .from('product_collections')
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
                            thumbnail,
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

