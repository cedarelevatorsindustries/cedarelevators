"use server"

import { createServerSupabase } from "@/lib/supabase/server"
import type {
    CollectionProduct,
    CollectionProductWithDetails,
    CreateCollectionProductData,
    UpdateCollectionProductData,
    ReorderCollectionProductsData
} from "@/lib/types/collection-products"

/**
 * Add a product to a collection
 * Collections are merchandising tools where order matters
 */
export async function addProductToCollection(data: CreateCollectionProductData) {
    try {
        const supabase = await createServerSupabase()

        // Check if already in collection
        const { data: existing } = await supabase
            .from('product_collections')
            .select('id')
            .eq('collection_id', data.collection_id)
            .eq('product_id', data.product_id)
            .single()

        if (existing) {
            return {
                success: false,
                error: 'Product is already in this collection'
            }
        }

        // Get current max position
        const { data: maxPos } = await supabase
            .from('product_collections')
            .select('position')
            .eq('collection_id', data.collection_id)
            .order('position', { ascending: false })
            .limit(1)
            .single()

        const position = data.position ?? (maxPos?.position ?? -1) + 1

        // Add product
        const { data: collectionProduct, error } = await supabase
            .from('product_collections')
            .insert({
                collection_id: data.collection_id,
                product_id: data.product_id,
                position
            })
            .select()
            .single()

        if (error) throw error

        return {
            success: true,
            collectionProduct: collectionProduct as CollectionProduct
        }
    } catch (error) {
        console.error('Error adding product to collection:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to add product'
        }
    }
}

/**
 * Remove a product from a collection
 * Does NOT delete the product - just removes from collection
 */
export async function removeProductFromCollection(collectionProductId: string) {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('product_collections')
            .delete()
            .eq('id', collectionProductId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error removing product from collection:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove product'
        }
    }
}

/**
 * Get all products in a collection (ordered by position)
 */
export async function getCollectionProducts(collectionId: string) {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('product_collections')
            .select(`
        id,
        collection_id,
        product_id,
        position,
        created_at,
        product:products!product_id (
          id,
          name,
          slug,
          thumbnail_url,
          thumbnail,
          price,
          status,
          allow_backorders,
          product_variants (
            id,
            inventory_quantity
          )
        )
      `)
            .eq('collection_id', collectionId)
            .order('position', { ascending: true })

        if (error) throw error

        // Debug logging to trace variant data
        console.log('[getCollectionProducts] Fetched products:', {
            collectionId,
            productCount: data?.length || 0,
            sampleProduct: data?.[0] ? {
                id: (data[0] as any).product?.id,
                name: (data[0] as any).product?.name,
                hasProductVariants: !!(data[0] as any).product?.product_variants,
                variantsCount: (data[0] as any).product?.product_variants?.length || 0,
                sampleVariant: (data[0] as any).product?.product_variants?.[0]
            } : null
        })

        return {
            success: true,
            products: data as unknown as CollectionProductWithDetails[]
        }
    } catch (error) {
        console.error('Error fetching collection products:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch products',
            products: []
        }
    }
}

/**
 * Update product position in collection
 */
export async function updateCollectionProductPosition(
    collectionProductId: string,
    data: UpdateCollectionProductData
) {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('product_collections')
            .update({ position: data.position })
            .eq('id', collectionProductId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error updating product position:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update position'
        }
    }
}

/**
 * Reorder products in a collection (drag-and-drop)
 */
export async function reorderCollectionProducts(data: ReorderCollectionProductsData) {
    try {
        const supabase = await createServerSupabase()

        // Update each product's position
        const updates = data.product_orders.map(({ product_id, position }) =>
            supabase
                .from('product_collections')
                .update({ position })
                .eq('collection_id', data.collection_id)
                .eq('product_id', product_id)
        )

        await Promise.all(updates)

        return { success: true }
    } catch (error) {
        console.error('Error reordering products:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reorder products'
        }
    }
}

/**
 * Get all collections that contain a specific product
 */
export async function getProductCollections(productId: string) {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('product_collections')
            .select(`
        id,
        collection_id,
        product_id,
        position,
        created_at,
        collection:collections!collection_id (
          id,
          title,
          slug,
          is_active
        )
      `)
            .eq('product_id', productId)

        if (error) throw error

        return {
            success: true,
            collections: data
        }
    } catch (error) {
        console.error('Error fetching product collections:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch collections',
            collections: []
        }
    }
}

