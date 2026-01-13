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
    context: DisplayContext,
    forGuest: boolean = false,
    categoryId?: string
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

        // Filter by show_in_guest for guest users
        if (forGuest) {
            query = query.eq('show_in_guest', true)
        }

        // Apply context-specific filters using appropriate collection_type
        if (context === 'homepage') {
            // Homepage: general collections (exclude category-specific and business-specific)
            query = query.eq('collection_type', 'general')
        } else if (context === 'categories') {
            // Categories context logic
            if (categoryId) {
                // If specific category page: Show ANY collection linked to this category
                // Explicit matching overrides collection_type
                query = query.eq('category_id', categoryId)
            } else {
                // Homepage Categories Tab: Show collections marked as 'category_specific'
                query = query.eq('collection_type', 'category_specific')
            }
        } else if (context === 'business_hub') {
            // Business Hub: business_specific collections
            query = query.eq('collection_type', 'business_specific')
        }

        const { data, error } = await query

        console.log('[getCollectionsByDisplayContext] Query result:', {
            context,
            forGuest,
            categoryId,
            dataCount: data?.length || 0,
            error: error?.message,
            firstCollection: data?.[0]
        })

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
    limit?: number,
    forGuest: boolean = false,
    categoryId?: string
): Promise<{ success: boolean; collections: CollectionWithProducts[]; error?: string }> {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            return { success: false, collections: [], error: 'Failed to create Supabase client' }
        }

        // First get collections by context (pass forGuest and categoryId filters)
        const { success, collections, error } = await getCollectionsByDisplayContext(context, forGuest, categoryId)

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
                const { data: collectionProducts, error: productsError } = await supabase
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
                            thumbnail_url,
                            price,
                            status
                        )
                    `)
                    .eq('collection_id', collection.id)
                    .order('position', { ascending: true })
                    .limit(20) // Limit products per collection

                if (productsError) {
                    console.error(`Error fetching products for collection ${collection.id}:`, productsError)
                }

                // Map the response to match ProductInCollection type
                const products = (collectionProducts || []).map((cp: any) => {
                    const rawProduct = Array.isArray(cp.product) ? cp.product[0] : cp.product
                    return {
                        id: cp.id,
                        product_id: cp.product_id,
                        collection_id: cp.collection_id,
                        position: cp.position,
                        created_at: cp.created_at,
                        product: rawProduct ? {
                            ...rawProduct,
                            // Convert price from rupees (database) to paise/cents (frontend)
                            // Database: 480.00 = ₹480, Frontend expects: 48000 (divides by 100)
                            price: rawProduct.price ? Math.round(rawProduct.price * 100) : null
                        } : null
                    }
                })

                return {
                    ...collection,
                    product_count: products.length,
                    products
                } as unknown as CollectionWithProducts
            })
        )

        console.log('[getCollectionsWithProductsByDisplayContext] Final result:', {
            context,
            forGuest,
            categoryId,
            collectionsCount: collectionsWithProducts.length,
            firstCollectionProductCount: collectionsWithProducts[0]?.products?.length || 0
        })

        return { success: true, collections: collectionsWithProducts }
    } catch (error: any) {
        console.error('Error in getCollectionsWithProductsByDisplayContext:', error)
        return { success: false, collections: [], error: error.message || 'Unknown error' }
    }
}

