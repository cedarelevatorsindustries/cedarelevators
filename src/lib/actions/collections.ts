"use server"

import { revalidatePath } from "next/cache"
import { createClerkSupabaseClient, createAdminClient } from "@/lib/supabase/server"
import type {
    Collection,
    CollectionWithProducts,
    CollectionFormData,
    CollectionFilters,
    CollectionStats
} from "@/lib/types/collections"

// =============================================
// GET COLLECTIONS
// =============================================

export async function getCollections(filters?: CollectionFilters) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Calculate pagination
        const page = filters?.page || 1
        const limit = filters?.limit || 20
        const offset = (page - 1) * limit

        let query = supabase
            .from('collections')
            .select('*', { count: 'exact' })
            .order('display_order', { ascending: true })
            .order('title', { ascending: true })

        // Apply filters
        if (filters?.is_active !== undefined) {
            query = query.eq('is_active', filters.is_active)
        }

        // Context filters
        if (filters?.collection_type) {
            query = query.eq('collection_type', filters.collection_type)
        }

        if (filters?.category_id) {
            query = query.eq('category_id', filters.category_id)
        }

        if (filters?.is_business_only !== undefined) {
            query = query.eq('is_business_only', filters.is_business_only)
        }

        if (filters?.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) throw error

        // Get product counts for each collection
        const collectionsWithCounts = await Promise.all(
            (data || []).map(async (collection) => {
                const { count } = await supabase
                    .from('product_collections')
                    .select('*', { count: 'exact', head: true })
                    .eq('collection_id', collection.id)

                return {
                    ...collection,
                    product_count: count || 0
                }
            })
        )

        const globalStats = await getCollectionStats()

        return {
            collections: collectionsWithCounts,
            stats: globalStats,
            success: true,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        }
    } catch (error) {
        console.error('Error fetching collections:', error)
        return { collections: [], error: 'Failed to fetch collections', success: false }
    }
}

// =============================================
// GET COLLECTION BY ID
// =============================================

export async function getCollectionById(id: string) {
    try {
        const supabase = await createClerkSupabaseClient()

        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('id', id)
            .single()

        // Silently return null if collection not found
        if (error) {
            if (error.code === 'PGRST116') {
                return { collection: null, success: false }
            }
            throw error
        }

        // Get products in this collection
        const { data: productCollections } = await supabase
            .from('product_collections')
            .select(`
        id,
        product_id,
        collection_id,
        position,
        created_at,
        product:products(id, name, slug, thumbnail, price, status)
      `)
            .eq('collection_id', id)
            .order('position', { ascending: true })

        const collection: CollectionWithProducts = {
            ...data,
            product_count: productCollections?.length || 0,
            products: productCollections || []
        }

        return { collection, success: true }
    } catch (error) {
        // Only log unexpected errors
        console.error('Error fetching collection:', error)
        return { collection: null, error: 'Failed to fetch collection', success: false }
    }
}

// =============================================
// GET COLLECTION BY SLUG
// =============================================

export async function getCollectionBySlug(slug: string) {
    try {
        const supabase = await createClerkSupabaseClient()

        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single()

        // Silently return null if collection not found (PGRST116 is "not found" error)
        if (error) {
            if (error.code === 'PGRST116') {
                return { collection: null, success: false }
            }
            throw error
        }

        // Get products
        const { data: productCollections } = await supabase
            .from('product_collections')
            .select(`
        id,
        product_id,
        collection_id,
        position,
        product:products(id, name, slug, thumbnail, price, status)
      `)
            .eq('collection_id', data.id)
            .order('position', { ascending: true })

        const collection: CollectionWithProducts = {
            ...data,
            product_count: productCollections?.length || 0,
            products: productCollections || []
        }

        return { collection, success: true }
    } catch (error) {
        // Only log unexpected errors, not "not found" errors
        console.error('Error fetching collection:', error)
        return { collection: null, error: 'Failed to fetch collection', success: false }
    }
}

// =============================================
// CREATE COLLECTION
// =============================================

export async function createCollection(formData: CollectionFormData) {
    try {
        const supabase = await createClerkSupabaseClient()

        const { data, error } = await supabase
            .from('collections')
            .insert({
                title: formData.title,
                slug: formData.slug,
                description: formData.description,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                // Context fields
                collection_type: formData.collection_type || 'general',
                category_id: formData.category_id || null,
                is_business_only: formData.is_business_only || false,
                display_order: formData.display_order || 0,
                // Validated new field
                show_in_guest: formData.show_in_guest ?? true,
                // STATUS logic: active -> is_active=true, draft/archived -> is_active=false
                status: formData.status || 'draft',
                is_active: formData.status === 'active'
            })
            .select()
            .single()

        if (error) throw error

        // Add products if provided
        if (formData.product_ids && formData.product_ids.length > 0) {
            await addProductsToCollection(data.id, formData.product_ids)
        }

        revalidatePath('/admin/collections')
        revalidatePath('/')

        return { collection: data, success: true }
    } catch (error: any) {
        console.error('Error creating collection:', error)
        return {
            collection: null,
            error: error.message || 'Failed to create collection',
            success: false
        }
    }
}

// =============================================
// UPDATE COLLECTION
// =============================================

export async function updateCollection(id: string, formData: Partial<CollectionFormData>) {
    try {
        const supabase = await createClerkSupabaseClient()

        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        if (formData.title !== undefined) updateData.title = formData.title
        if (formData.slug !== undefined) updateData.slug = formData.slug
        if (formData.description !== undefined) updateData.description = formData.description
        if (formData.is_active !== undefined) updateData.is_active = formData.is_active
        if (formData.meta_title !== undefined) updateData.meta_title = formData.meta_title
        if (formData.meta_description !== undefined) updateData.meta_description = formData.meta_description
        // Context fields
        if (formData.collection_type !== undefined) updateData.collection_type = formData.collection_type
        if (formData.category_id !== undefined) updateData.category_id = formData.category_id
        if (formData.is_business_only !== undefined) updateData.is_business_only = formData.is_business_only
        if (formData.display_order !== undefined) updateData.display_order = formData.display_order
        // New Field
        if (formData.show_in_guest !== undefined) updateData.show_in_guest = formData.show_in_guest
        // Status & Active sync
        if (formData.status !== undefined) {
            updateData.status = formData.status
            updateData.is_active = formData.status === 'active'
        } else if (formData.is_active !== undefined) {
            // Backward compatibility: if only is_active is passed
            updateData.is_active = formData.is_active
            // Don't overwrite status if not provided, or infer? 
            // Better to prefer status if available.
        }

        const { data, error } = await supabase
            .from('collections')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/collections')
        revalidatePath('/')

        return { collection: data, success: true }
    } catch (error: any) {
        console.error('Error updating collection:', error)
        return {
            collection: null,
            error: error.message || 'Failed to update collection',
            success: false
        }
    }
}

// =============================================
// DELETE COLLECTION
// =============================================

export async function deleteCollection(id: string) {
    try {
        const supabase = await createClerkSupabaseClient()

        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/admin/collections')
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error('Error deleting collection:', error)
        return {
            success: false,
            error: error.message || 'Failed to delete collection'
        }
    }
}

// =============================================
// TOGGLE COLLECTION STATUS
// =============================================

export async function toggleCollectionStatus(id: string) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get current status
        const { data: collection } = await supabase
            .from('collections')
            .select('is_active, status')
            .eq('id', id)
            .single()

        if (!collection) throw new Error('Collection not found')

        // Toggle both is_active and status to keep them in sync
        const newIsActive = !collection.is_active
        const newStatus = newIsActive ? 'active' : 'draft'

        const { data, error } = await supabase
            .from('collections')
            .update({
                is_active: newIsActive,
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/collections')
        revalidatePath('/')

        return { collection: data, success: true }
    } catch (error: any) {
        console.error('Error toggling collection status:', error)
        return {
            collection: null,
            error: error.message || 'Failed to toggle status',
            success: false
        }
    }
}

// =============================================
// ADD PRODUCTS TO COLLECTION
// =============================================

export async function addProductsToCollection(collectionId: string, productIds: string[]) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Get current max position
        const { data: existing } = await supabase
            .from('product_collections')
            .select('position')
            .eq('collection_id', collectionId)
            .order('position', { ascending: false })
            .limit(1)

        const startPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

        // Insert products
        const inserts = productIds.map((productId, index) => ({
            collection_id: collectionId,
            product_id: productId,
            position: startPosition + index
        }))

        const { error } = await supabase
            .from('product_collections')
            .insert(inserts)

        if (error) throw error

        revalidatePath('/admin/collections')
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error('Error adding products to collection:', error)
        return {
            success: false,
            error: error.message || 'Failed to add products'
        }
    }
}

// =============================================
// REMOVE PRODUCT FROM COLLECTION
// =============================================

export async function removeProductFromCollection(collectionId: string, productId: string) {
    try {
        const supabase = await createClerkSupabaseClient()

        const { error } = await supabase
            .from('product_collections')
            .delete()
            .eq('collection_id', collectionId)
            .eq('product_id', productId)

        if (error) throw error

        revalidatePath('/admin/collections')
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error('Error removing product from collection:', error)
        return {
            success: false,
            error: error.message || 'Failed to remove product'
        }
    }
}

// =============================================
// REORDER COLLECTION PRODUCTS
// =============================================

export async function reorderCollectionProducts(collectionId: string, orderedProductIds: string[]) {
    try {
        const supabase = await createClerkSupabaseClient()

        // Update positions
        const updates = orderedProductIds.map((productId, index) =>
            supabase
                .from('product_collections')
                .update({ position: index })
                .eq('collection_id', collectionId)
                .eq('product_id', productId)
        )

        await Promise.all(updates)

        revalidatePath('/admin/collections')
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error('Error reordering products:', error)
        return {
            success: false,
            error: error.message || 'Failed to reorder products'
        }
    }
}

// =============================================
// UPLOAD COLLECTION IMAGE
// =============================================

export async function uploadCollectionImage(file: File) {
    try {
        const { uploadToCloudinary } = await import('@/lib/cloudinary/upload')

        const result = await uploadToCloudinary(file, 'cedar/collections')

        if (!result.success || !result.url) {
            throw new Error(result.error || 'Failed to upload image')
        }

        return { url: result.url, success: true }
    } catch (error: any) {
        console.error('Error uploading image:', error)
        return {
            url: null,
            error: error.message || 'Failed to upload image',
            success: false
        }
    }
}

// =============================================
// GET COLLECTION STATS
// =============================================

export async function getCollectionStats(): Promise<CollectionStats> {
    try {
        const supabase = await createAdminClient()

        const { count: total } = await supabase
            .from('collections')
            .select('*', { count: 'exact', head: true })

        const { count: active } = await supabase
            .from('collections')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)

        const { count: totalProducts } = await supabase
            .from('product_collections')
            .select('*', { count: 'exact', head: true })

        return {
            total: total || 0,
            active: active || 0,
            total_products: totalProducts || 0
        }
    } catch (error) {
        console.error('Error fetching collection stats:', error)
        return {
            total: 0,
            active: 0,
            total_products: 0
        }
    }
}

// =============================================
// GET COLLECTIONS FOR DISPLAY LOCATION
// =============================================

// REMOVED getCollectionsForDisplay - Use getCollections with appropriate context filters instead


