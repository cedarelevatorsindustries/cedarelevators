// =============================================
// CONTEXT-AWARE COLLECTION FUNCTIONS
// =============================================

"use server"

import { revalidatePath } from "next/cache"
import { createClerkSupabaseClient } from "@/lib/supabase/server"
import type { Collection, CollectionWithProducts } from "@/lib/types/collections"

// =============================================
// GET HOMEPAGE COLLECTIONS (General only, 5 products)
// =============================================

// =============================================
// GET HOMEPAGE COLLECTIONS (General only, 5 products)
// =============================================

export async function getHomepageCollections(limit = 5) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get general collections only
        const { data: collections, error } = await supabase
            .from('collections')
            .select('*')
            .eq('is_active', true)
            .eq('collection_type', 'general')
            .order('display_order', { ascending: true })
            .order('title', { ascending: true })

        if (error) throw error

        // Get products for each collection (limited to 5)
        const collectionsWithProducts = await Promise.all(
            (collections || []).map(async (collection) => {
                const { data: productCollections } = await supabase
                    .from('product_collections')
                    .select(`
                        id,
                        product_id,
                        collection_id,
                        position,
                        products (
                            id,
                            name,
                            slug,
                            thumbnail,
                            price,
                            status,
                            handle
                        )
                    `)
                    .eq('collection_id', collection.id)
                    .order('position', { ascending: true })
                    .limit(limit)

                const products = (productCollections || []).map(pc => {
                    const product = pc.products as any
                    return {
                        id: product.id,
                        title: product.name,
                        name: product.name,
                        slug: product.slug,
                        handle: product.handle || product.slug,
                        thumbnail: product.thumbnail,
                        price: product.price ? {
                            amount: product.price,
                            currency_code: 'INR'
                        } : undefined
                    }
                })

                return {
                    ...collection,
                    products,
                    product_count: products.length
                }
            })
        )

        return { collections: collectionsWithProducts, success: true }
    } catch (error) {
        console.error('Error fetching homepage collections:', error)
        return { collections: [], error: 'Failed to fetch collections', success: false }
    }
}

// =============================================
// GET CATEGORY COLLECTIONS (Category-specific only, 5 products)
// =============================================

export async function getCategoryCollections(categoryId: string, limit = 5) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get category-specific collections
        const { data: collections, error } = await supabase
            .from('collections')
            .select('*')
            .eq('is_active', true)
            .eq('collection_type', 'category_specific')
            .eq('category_id', categoryId)
            .order('display_order', { ascending: true })
            .order('title', { ascending: true })

        if (error) throw error

        // Get products for each collection (limited to 5)
        const collectionsWithProducts = await Promise.all(
            (collections || []).map(async (collection) => {
                const { data: productCollections } = await supabase
                    .from('product_collections')
                    .select(`
                        id,
                        product_id,
                        collection_id,
                        position,
                        products (
                            id,
                            name,
                            slug,
                            thumbnail,
                            price,
                            status,
                            handle
                        )
                    `)
                    .eq('collection_id', collection.id)
                    .order('position', { ascending: true })
                    .limit(limit)

                const products = (productCollections || []).map(pc => {
                    const product = pc.products as any
                    return {
                        id: product.id,
                        title: product.name,
                        name: product.name,
                        slug: product.slug,
                        handle: product.handle || product.slug,
                        thumbnail: product.thumbnail,
                        price: product.price ? {
                            amount: product.price,
                            currency_code: 'INR'
                        } : undefined
                    }
                })

                return {
                    ...collection,
                    products,
                    product_count: products.length
                }
            })
        )

        return { collections: collectionsWithProducts, success: true }
    } catch (error) {
        console.error('Error fetching category collections:', error)
        return { collections: [], error: 'Failed to fetch collections', success: false }
    }
}

// =============================================
// GET BUSINESS COLLECTIONS (Business-specific only, 5 products)
// =============================================

export async function getBusinessCollections(limit = 5) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get business-specific collections
        const { data: collections, error } = await supabase
            .from('collections')
            .select('*')
            .eq('is_active', true)
            .eq('is_business_only', true)
            .order('display_order', { ascending: true })
            .order('title', { ascending: true })

        if (error) throw error

        // Get products for each collection (limited to 5)
        const collectionsWithProducts = await Promise.all(
            (collections || []).map(async (collection) => {
                const { data: productCollections } = await supabase
                    .from('product_collections')
                    .select(`
                        id,
                        product_id,
                        collection_id,
                        position,
                        products (
                            id,
                            name,
                            slug,
                            thumbnail,
                            price,
                            status,
                            handle
                        )
                    `)
                    .eq('collection_id', collection.id)
                    .order('position', { ascending: true })
                    .limit(limit)

                const products = (productCollections || []).map(pc => {
                    const product = pc.products as any
                    return {
                        id: product.id,
                        title: product.name,
                        name: product.name,
                        slug: product.slug,
                        handle: product.handle || product.slug,
                        thumbnail: product.thumbnail,
                        price: product.price ? {
                            amount: product.price,
                            currency_code: 'INR'
                        } : undefined
                    }
                })

                return {
                    ...collection,
                    products,
                    product_count: products.length
                }
            })
        )

        return { collections: collectionsWithProducts, success: true }
    } catch (error) {
        console.error('Error fetching business collections:', error)
        return { collections: [], error: 'Failed to fetch collections', success: false }
    }
}

// =============================================
// GET CATALOG COLLECTIONS (All collections, all products)
// =============================================

export async function getCatalogCollections() {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get ALL collections
        const { data: collections, error } = await supabase
            .from('collections')
            .select('*')
            .eq('is_active', true)
            .order('collection_type', { ascending: true }) // Group by type
            .order('display_order', { ascending: true })
            .order('title', { ascending: true })

        if (error) throw error

        // Get ALL products for each collection (no limit)
        const collectionsWithProducts = await Promise.all(
            (collections || []).map(async (collection) => {
                const { data: productCollections } = await supabase
                    .from('product_collections')
                    .select(`
                        id,
                        product_id,
                        collection_id,
                        position,
                        products (
                            id,
                            name,
                            slug,
                            thumbnail,
                            price,
                            status,
                            handle,
                            description
                        )
                    `)
                    .eq('collection_id', collection.id)
                    .order('position', { ascending: true })
                // NO LIMIT - show all products in catalog

                const products = (productCollections || []).map(pc => {
                    const product = pc.products as any
                    return {
                        id: product.id,
                        title: product.name,
                        name: product.name,
                        slug: product.slug,
                        handle: product.handle || product.slug,
                        thumbnail: product.thumbnail,
                        description: product.description,
                        price: product.price ? {
                            amount: product.price,
                            currency_code: 'INR'
                        } : undefined
                    }
                })

                return {
                    ...collection,
                    products,
                    product_count: products.length
                }
            })
        )

        return { collections: collectionsWithProducts, success: true }
    } catch (error) {
        console.error('Error fetching catalog collections:', error)
        return { collections: [], error: 'Failed to fetch collections', success: false }
    }
}

// =============================================
// GET COLLECTION PRODUCTS (For "View All" in catalog)
// =============================================

export async function getCollectionProducts(collectionSlug: string, limit?: number) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get collection by slug
        const { data: collection, error: collectionError } = await supabase
            .from('collections')
            .select('*')
            .eq('slug', collectionSlug)
            .eq('is_active', true)
            .single()

        if (collectionError) throw collectionError

        // Get products
        let query = supabase
            .from('product_collections')
            .select(`
                id,
                product_id,
                collection_id,
                position,
                products (
                    id,
                    name,
                    slug,
                    thumbnail,
                    price,
                    status,
                    handle,
                    description,
                    metadata
                )
            `)
            .eq('collection_id', collection.id)
            .order('position', { ascending: true })

        // Apply limit if provided (for preview), otherwise show all
        if (limit) {
            query = query.limit(limit)
        }

        const { data: productCollections, error: productsError } = await query

        if (productsError) throw productsError

        const products = (productCollections || []).map(pc => {
            const product = pc.products as any
            return {
                id: product.id,
                title: product.name,
                name: product.name,
                slug: product.slug,
                handle: product.handle || product.slug,
                thumbnail: product.thumbnail,
                description: product.description,
                metadata: product.metadata,
                price: product.price ? {
                    amount: product.price,
                    currency_code: 'INR'
                } : undefined
            }
        })

        return {
            collection: {
                ...collection,
                products,
                product_count: products.length
            },
            success: true
        }
    } catch (error) {
        console.error('Error fetching collection products:', error)
        return { collection: null, error: 'Failed to fetch products', success: false }
    }
}

