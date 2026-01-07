'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { CategoryFormData } from '@/lib/types/categories'

// =============================================
// HELPER
// =============================================

function ensureSupabase(client: ReturnType<typeof createServerSupabaseClient>) {
    if (!client) {
        throw new Error('Failed to create Supabase client')
    }
    return client
}

// =============================================
// GET SUBCATEGORIES BY PARENT ID
// =============================================

export async function getSubcategoriesByParentId(parentId: string) {
    try {
        const supabase = ensureSupabase(createServerSupabaseClient())

        // Get subcategory IDs from junction table
        const { data: junctionData, error: junctionError } = await supabase
            .from('category_subcategories')
            .select('subcategory_id')
            .eq('category_id', parentId)

        if (junctionError) throw junctionError

        if (!junctionData || junctionData.length === 0) {
            return { subcategories: [], success: true }
        }

        const subcategoryIds = junctionData.map(j => j.subcategory_id)

        // Fetch subcategories from subcategories table
        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .in('id', subcategoryIds)
            .order('categories_card_position', { ascending: true, nullsFirst: false })
            .order('title', { ascending: true })

        if (error) throw error

        // Get product counts for each subcategory
        const subcategoriesWithCounts = await Promise.all(
            (data || []).map(async (sub) => {
                const { count } = await supabase
                    .from('product_subcategories')
                    .select('*', { count: 'exact', head: true })
                    .eq('subcategory_id', sub.id)

                return {
                    ...sub,
                    name: sub.title,
                    parent_id: parentId,
                    product_count: count || 0
                }
            })
        )

        return { subcategories: subcategoriesWithCounts, success: true }
    } catch (error) {
        console.error('Error fetching subcategories:', error)
        return { subcategories: [], error: 'Failed to fetch subcategories', success: false }
    }
}

// =============================================
// GET SUBCATEGORY BY ID
// =============================================

export async function getSubcategoryById(id: string) {
    try {
        const supabase = ensureSupabase(createServerSupabaseClient())

        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        // Get parent_id from junction table (may have 0 or 1 rows)
        const { data: junctionData } = await supabase
            .from('category_subcategories')
            .select('category_id')
            .eq('subcategory_id', id)
            .limit(1)

        const subcategory = {
            ...data,
            name: data.title,
            parent_id: junctionData && junctionData.length > 0 ? junctionData[0].category_id : null
        }

        return { category: subcategory, success: true }
    } catch (error) {
        console.error('Error fetching subcategory:', error)
        return { category: null, error: 'Failed to fetch subcategory', success: false }
    }
}

// =============================================
// CREATE SUBCATEGORY
// =============================================

export async function createSubcategory(formData: CategoryFormData) {
    try {
        const supabase = ensureSupabase(createServerSupabaseClient())

        if (!formData.parent_id) {
            throw new Error('parent_id is required for creating a subcategory')
        }

        console.log('[createSubcategory] Creating subcategory in subcategories table')

        const subcategoryData = {
            title: formData.name,
            handle: formData.slug,
            description: formData.description,
            thumbnail: formData.thumbnail_image,
            categories_card_position: formData.categories_card_position ? parseInt(String(formData.categories_card_position), 10) : null,
            status: formData.status || 'active',
            seo_meta_title: formData.seo_meta_title,
            seo_meta_description: formData.seo_meta_description
        }

        const { data, error } = await supabase
            .from('subcategories')
            .insert(subcategoryData)
            .select()
            .single()

        if (error) throw error

        console.log('[createSubcategory] Created:', data?.id, 'parent_id:', formData.parent_id)

        // Create the relationship in category_subcategories
        console.log('[createSubcategory] Inserting into category_subcategories:', {
            category_id: formData.parent_id,
            subcategory_id: data.id
        })

        const { error: junctionError } = await supabase
            .from('category_subcategories')
            .insert({
                category_id: formData.parent_id,
                subcategory_id: data.id
            })

        if (junctionError) {
            console.error('Error creating subcategory relationship:', junctionError)
            // Don't throw here, the subcategory was created successfully
        } else {
            console.log('[createSubcategory] Successfully created subcategory relationship')
        }

        revalidatePath('/admin/categories')
        revalidatePath('/')

        return { category: data, success: true, isSubcategory: true }
    } catch (error: any) {
        console.error('Error creating subcategory:', error)
        return {
            category: null,
            error: error.message || 'Failed to create subcategory',
            success: false,
            isSubcategory: true
        }
    }
}

// =============================================
// UPDATE SUBCATEGORY
// =============================================

export async function updateSubcategory(id: string, formData: Partial<CategoryFormData>) {
    try {
        const supabase = ensureSupabase(createServerSupabaseClient())

        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        // Subcategory fields (simplified schema)
        if (formData.name !== undefined) updateData.title = formData.name
        if (formData.slug !== undefined) updateData.handle = formData.slug
        if (formData.description !== undefined) updateData.description = formData.description
        if (formData.thumbnail_image !== undefined) updateData.thumbnail = formData.thumbnail_image
        if (formData.categories_card_position !== undefined) {
            updateData.categories_card_position = formData.categories_card_position ? parseInt(String(formData.categories_card_position), 10) : null
        }
        if (formData.status !== undefined) updateData.status = formData.status
        if (formData.seo_meta_title !== undefined) updateData.seo_meta_title = formData.seo_meta_title
        if (formData.seo_meta_description !== undefined) updateData.seo_meta_description = formData.seo_meta_description

        const { data, error } = await supabase
            .from('subcategories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // Handle parent_id changes for subcategory relationships
        if (formData.parent_id !== undefined && data) {
            // First, remove any existing parent relationships for this subcategory
            await supabase
                .from('category_subcategories')
                .delete()
                .eq('subcategory_id', id)

            // If new parent_id is provided, create the new relationship
            if (formData.parent_id) {
                const { error: junctionError } = await supabase
                    .from('category_subcategories')
                    .insert({
                        category_id: formData.parent_id,
                        subcategory_id: id
                    })

                if (junctionError) {
                    console.error('Error updating subcategory relationship:', junctionError)
                }
            }
        }

        revalidatePath('/admin/categories')
        revalidatePath('/')

        return { category: data, success: true }
    } catch (error: any) {
        console.error('Error updating subcategory:', error)
        return {
            category: null,
            error: error.message || 'Failed to update subcategory',
            success: false
        }
    }
}

// =============================================
// DELETE SUBCATEGORY
// =============================================

export async function deleteSubcategory(id: string) {
    try {
        const supabase = ensureSupabase(createServerSupabaseClient())

        // First, delete the junction table relationship
        await supabase
            .from('category_subcategories')
            .delete()
            .eq('subcategory_id', id)

        // Then delete the subcategory
        const { error } = await supabase
            .from('subcategories')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/admin/categories')
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error('Error deleting subcategory:', error)
        return {
            error: error.message || 'Failed to delete subcategory',
            success: false
        }
    }
}
