"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabase, createAdminClient } from "@/lib/supabase/server"

interface CategorySubcategory {
    id: string
    category_id: string
    subcategory_id: string
    sort_order: number
    created_at: string
}

interface CategorySubcategoryWithDetails extends CategorySubcategory {
    subcategory: {
        id: string
        title: string
        slug: string
        thumbnail_image?: string
        description?: string
    }
}

interface CreateCategorySubcategoryData {
    category_id: string
    subcategory_id: string
    sort_order?: number
}

/**
 * Link a subcategory to a category
 * Categories curate which subcategories to show
 */
export async function linkSubcategoryToCategory(data: CreateCategorySubcategoryData) {
    try {
        const supabase = createAdminClient()

        // Check if link already exists
        const { data: existing } = await supabase
            .from('category_subcategories')
            .select('id')
            .eq('category_id', data.category_id)
            .eq('subcategory_id', data.subcategory_id)
            .single()

        if (existing) {
            return {
                success: false,
                error: 'Subcategory is already linked to this category'
            }
        }

        // Create the link
        const { data: link, error } = await supabase
            .from('category_subcategories')
            .insert({
                category_id: data.category_id,
                subcategory_id: data.subcategory_id,
                sort_order: data.sort_order || 0
            })
            .select()
            .single()

        if (error) throw error

        return {
            success: true,
            link: link as CategorySubcategory
        }
    } catch (error) {
        console.error('Error linking subcategory to category:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to link subcategory'
        }
    }
}

/**
 * Unlink a subcategory from a category
 * Does NOT delete the subcategory - just removes from category's curated view
 */
export async function unlinkSubcategoryFromCategory(linkId: string) {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('category_subcategories')
            .delete()
            .eq('id', linkId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error unlinking subcategory from category:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to unlink subcategory'
        }
    }
}

/**
 * Get all subcategories linked to a category
 */
export async function getCategorySubcategories(categoryId: string) {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('category_subcategories')
            .select(`
                id,
                category_id,
                subcategory_id,
                sort_order,
                created_at,
                subcategory:subcategories!subcategory_id (
                    id,
                    title,
                    slug,
                    thumbnail,
                    thumbnail_image,
                    description
                )
            `)
            .eq('category_id', categoryId)
            .order('sort_order', { ascending: true })

        if (error) throw error

        return {
            success: true,
            links: data as unknown as CategorySubcategoryWithDetails[]
        }
    } catch (error) {
        console.error('Error fetching category subcategories:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch subcategories',
            links: []
        }
    }
}

/**
 * Get all categories that link to a specific subcategory
 * Used in Subcategory detail page to show "Used In" categories
 */
export async function getSubcategoryCategories(subcategoryId: string) {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('category_subcategories')
            .select(`
                id,
                category_id,
                subcategory_id,
                sort_order,
                created_at,
                category:categories!category_id (
                    id,
                    name,
                    handle,
                    thumbnail_image
                )
            `)
            .eq('subcategory_id', subcategoryId)
            .order('sort_order', { ascending: true })

        if (error) throw error

        return {
            success: true,
            categories: data
        }
    } catch (error) {
        console.error('Error fetching subcategory categories:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch categories',
            categories: []
        }
    }
}

/**
 * Update sort order of a subcategory within a category
 */
export async function updateCategorySubcategoryOrder(linkId: string, sortOrder: number) {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('category_subcategories')
            .update({
                sort_order: sortOrder,
                updated_at: new Date().toISOString()
            })
            .eq('id', linkId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error updating subcategory order:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update order'
        }
    }
}

/**
 * Bulk update subcategory order within a category
 */
export async function reorderCategorySubcategories(
    categoryId: string,
    subcategoryOrders: Array<{ subcategory_id: string; sort_order: number }>
) {
    try {
        const supabase = await createServerSupabase()

        // Update each link's sort order
        const updates = subcategoryOrders.map(({ subcategory_id, sort_order }) =>
            supabase
                .from('category_subcategories')
                .update({ sort_order, updated_at: new Date().toISOString() })
                .eq('category_id', categoryId)
                .eq('subcategory_id', subcategory_id)
        )

        await Promise.all(updates)

        return { success: true }
    } catch (error) {
        console.error('Error reordering subcategories:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reorder subcategories'
        }
    }
}

/**
 * Move a subcategory from one category to another
 * Updates the junction table to change the parent category
 * Uses database function for atomic operation
 */
export async function moveSubcategoryToCategory(
    subcategoryId: string,
    fromCategoryId: string,
    toCategoryId: string
) {
    try {
        const supabase = await createServerSupabase()

        // Use the database function for atomic operation
        const { data, error } = await supabase
            .rpc('move_subcategory', {
                p_subcategory_id: subcategoryId,
                p_from_category_id: fromCategoryId,
                p_to_category_id: toCategoryId
            })

        if (error) throw error

        // Parse the JSON result from the function
        const result = data as { success: boolean; error?: string; message?: string }

        if (!result.success) {
            return {
                success: false,
                error: result.error || 'Failed to move subcategory'
            }
        }

        // Revalidate relevant paths
        revalidatePath('/admin/categories')
        revalidatePath('/')

        return { success: true }
    } catch (error) {
        console.error('Error moving subcategory:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to move subcategory'
        }
    }
}
