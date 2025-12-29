"use server"

import { revalidatePath } from "next/cache"
import { createClerkSupabaseClient } from "@/lib/supabase/server"
import type {
  Application,
  ApplicationWithStats,
  ApplicationFormData,
  ApplicationFilters,
  ApplicationStats
} from "@/lib/types/applications"

// =============================================
// GET APPLICATIONS
// =============================================

export async function getApplications(filters?: ApplicationFilters) {
  try {
    const supabase = await createClerkSupabaseClient()

    // Applications are categories with parent_id = NULL
    let query = supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    // Enhance with stats for each application
    const applicationsWithStats: ApplicationWithStats[] = await Promise.all(
      (data || []).map(async (app) => {
        // Count categories (children with this app as parent)
        const { count: categoryCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('parent_id', app.id)

        // Count subcategories (grandchildren)
        const { data: categories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', app.id)
        
        let subcategoryCount = 0
        if (categories && categories.length > 0) {
          const categoryIds = categories.map(c => c.id)
          const { count } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .in('parent_id', categoryIds)
          subcategoryCount = count || 0
        }

        // Count products
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('application_id', app.id)

        return {
          ...app,
          category_count: categoryCount || 0,
          subcategory_count: subcategoryCount,
          product_count: productCount || 0
        }
      })
    )

    return { applications: applicationsWithStats, success: true }
  } catch (error) {
    console.error('Error fetching applications:', error)
    return { applications: [], error: 'Failed to fetch applications', success: false }
  }
}

// =============================================
// GET APPLICATION BY ID
// =============================================

export async function getApplicationById(id: string) {
  try {
    const supabase = await createClerkSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .is('parent_id', null)
      .single()

    if (error) throw error

    // Get counts
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id)

    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('application_id', id)

    const application: ApplicationWithStats = {
      ...data,
      category_count: categoryCount || 0,
      product_count: productCount || 0
    }

    return { application, success: true }
  } catch (error) {
    console.error('Error fetching application:', error)
    return { application: null, error: 'Failed to fetch application', success: false }
  }
}

// =============================================
// CREATE APPLICATION
// =============================================

export async function createApplication(formData: ApplicationFormData) {
  try {
    const supabase = await createClerkSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parent_id: null, // Always null for applications
        image_url: formData.image_url,
        thumbnail_image: formData.thumbnail_image,
        banner_image: formData.banner_image,
        image_alt: formData.image_alt,
        icon: formData.icon,
        sort_order: formData.sort_order || 0,
        is_active: formData.is_active !== false,
        status: formData.status || 'active',
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        application: formData.slug, // Set application field to its own slug
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/applications')

    return { application: data, success: true }
  } catch (error) {
    console.error('Error creating application:', error)
    return { application: null, error: 'Failed to create application', success: false }
  }
}

// =============================================
// UPDATE APPLICATION
// =============================================

export async function updateApplication(id: string, formData: Partial<ApplicationFormData>) {
  try {
    const supabase = await createClerkSupabaseClient()

    const updateData: any = {
      ...formData,
      updated_at: new Date().toISOString(),
    }

    // If name or slug changes, update application field
    if (formData.slug) {
      updateData.application = formData.slug
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .is('parent_id', null) // Safety: only update applications
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/applications')
    revalidatePath(`/admin/applications/${id}`)

    return { application: data, success: true }
  } catch (error) {
    console.error('Error updating application:', error)
    return { application: null, error: 'Failed to update application', success: false }
  }
}

// =============================================
// DELETE APPLICATION
// =============================================

export async function deleteApplication(id: string) {
  try {
    const supabase = await createClerkSupabaseClient()

    // Check if application has categories
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id)

    if (categoryCount && categoryCount > 0) {
      return {
        success: false,
        error: `Cannot delete application with ${categoryCount} categories. Delete or reassign categories first.`
      }
    }

    // Check if application has products
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('application_id', id)

    if (productCount && productCount > 0) {
      return {
        success: false,
        error: `Cannot delete application with ${productCount} products. Delete or reassign products first.`
      }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .is('parent_id', null)

    if (error) throw error

    revalidatePath('/admin/applications')

    return { success: true }
  } catch (error) {
    console.error('Error deleting application:', error)
    return { success: false, error: 'Failed to delete application' }
  }
}

// =============================================
// GET APPLICATION STATS
// =============================================

export async function getApplicationStats(): Promise<ApplicationStats> {
  try {
    const supabase = await createClerkSupabaseClient()

    // Total applications
    const { count: total } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .is('parent_id', null)

    // Active applications
    const { count: active } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .is('parent_id', null)
      .eq('is_active', true)

    // Get all application IDs
    const { data: applications } = await supabase
      .from('categories')
      .select('id')
      .is('parent_id', null)

    const appIds = (applications || []).map(app => app.id)

    // Total categories (direct children of applications)
    const { count: totalCategories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .in('parent_id', appIds)

    // Get category IDs for subcategory count
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .in('parent_id', appIds)

    const categoryIds = (categories || []).map(cat => cat.id)

    // Total subcategories (children of categories)
    let totalSubcategories = 0
    if (categoryIds.length > 0) {
      const { count } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .in('parent_id', categoryIds)
      totalSubcategories = count || 0
    }

    // Total products across all applications
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .in('application_id', appIds)

    return {
      total: total || 0,
      active: active || 0,
      inactive: (total || 0) - (active || 0),
      total_categories: totalCategories || 0,
      total_subcategories: totalSubcategories,
      total_products: totalProducts || 0
    }
  } catch (error) {
    console.error('Error fetching application stats:', error)
    return {
      total: 0,
      active: 0,
      inactive: 0,
      total_categories: 0,
      total_subcategories: 0,
      total_products: 0
    }
  }
}

// =============================================
// UPLOAD APPLICATION IMAGE
// =============================================

export async function uploadApplicationImage(file: File) {
  try {
    const supabase = await createClerkSupabaseClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `applications/${fileName}`

    const { data, error } = await supabase.storage
      .from('categories')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('categories')
      .getPublicUrl(filePath)

    return { url: publicUrl, success: true }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { url: null, error: 'Failed to upload image', success: false }
  }
}
