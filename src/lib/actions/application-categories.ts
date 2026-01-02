"use server"

import { createServerSupabase } from "@/lib/supabase/server"
import type {
    ApplicationCategory,
    ApplicationCategoryWithDetails,
    CreateApplicationCategoryData,
    UpdateApplicationCategoryData
} from "@/lib/types/application-categories"

/**
 * Link a category to an application
 * Applications curate which global categories to show
 */
export async function linkCategoryToApplication(data: CreateApplicationCategoryData) {
    try {
        const supabase = await createServerSupabase()

        // Check if link already exists
        const { data: existing } = await supabase
            .from('application_categories')
            .select('id')
            .eq('application_id', data.application_id)
            .eq('category_id', data.category_id)
            .single()

        if (existing) {
            return {
                success: false,
                error: 'Category is already linked to this application'
            }
        }

        // Create the link
        const { data: link, error } = await supabase
            .from('application_categories')
            .insert({
                application_id: data.application_id,
                category_id: data.category_id,
                sort_order: data.sort_order || 0
            })
            .select()
            .single()

        if (error) throw error

        return {
            success: true,
            link: link as ApplicationCategory
        }
    } catch (error) {
        console.error('Error linking category to application:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to link category'
        }
    }
}

/**
 * Unlink a category from an application
 * Does NOT delete the category - just removes from application's curated view
 */
export async function unlinkCategoryFromApplication(linkId: string) {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('application_categories')
            .delete()
            .eq('id', linkId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error unlinking category from application:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to unlink category'
        }
    }
}

/**
 * Get all categories linked to an application
 */
export async function getApplicationCategories(applicationId: string) {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('application_categories')
            .select(`
        id,
        application_id,
        category_id,
        sort_order,
        created_at,
        updated_at,
        category:categories!category_id (
          id,
          name,
          slug,
          thumbnail_image
        )
      `)
            .eq('application_id', applicationId)
            .order('sort_order', { ascending: true })

        if (error) throw error

        return {
            success: true,
            links: data as unknown as ApplicationCategoryWithDetails[]
        }
    } catch (error) {
        console.error('Error fetching application categories:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch categories',
            links: []
        }
    }
}

/**
 * Get all applications that link to a specific category
 * Used in Category detail page to show "Used In" applications
 */
export async function getCategoryApplications(categoryId: string) {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('application_categories')
            .select(`
        id,
        application_id,
        category_id,
        sort_order,
        created_at,
        application:categories!application_id (
          id,
          name,
          slug,
          thumbnail_image
        )
      `)
            .eq('category_id', categoryId)
            .order('sort_order', { ascending: true })

        if (error) throw error

        return {
            success: true,
            applications: data
        }
    } catch (error) {
        console.error('Error fetching category applications:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch applications',
            applications: []
        }
    }
}

/**
 * Update sort order of a category within an application
 */
export async function updateApplicationCategoryOrder(linkId: string, data: UpdateApplicationCategoryData) {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('application_categories')
            .update({
                sort_order: data.sort_order,
                updated_at: new Date().toISOString()
            })
            .eq('id', linkId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error updating category order:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update order'
        }
    }
}

/**
 * Bulk update category order within an application
 */
export async function reorderApplicationCategories(
    applicationId: string,
    categoryOrders: Array<{ category_id: string; sort_order: number }>
) {
    try {
        const supabase = await createServerSupabase()

        // Update each link's sort order
        const updates = categoryOrders.map(({ category_id, sort_order }) =>
            supabase
                .from('application_categories')
                .update({ sort_order, updated_at: new Date().toISOString() })
                .eq('application_id', applicationId)
                .eq('category_id', category_id)
        )

        await Promise.all(updates)

        return { success: true }
    } catch (error) {
        console.error('Error reordering categories:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reorder categories'
        }
    }
}
