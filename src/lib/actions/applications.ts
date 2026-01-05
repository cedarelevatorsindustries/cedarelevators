"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type {
  Application,
  ApplicationWithStats,
  ApplicationFormData,
  ApplicationFilters,
  ApplicationStats
} from "@/lib/types/applications"

// Helper to ensure supabase client is not null
function ensureSupabase(client: ReturnType<typeof createServerSupabaseClient>) {
  if (!client) {
    throw new Error('Failed to create Supabase client')
  }
  return client
}

// =============================================
// GET APPLICATIONS
// =============================================

export async function getApplications(filters?: ApplicationFilters) {
  try {
    const supabase = ensureSupabase(createServerSupabaseClient())

    // Calculate pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    // Get applications from categories table (these are top-level entities)
    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .eq('type', 'application') // Applications have type = 'application'
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Enhance with stats for each application
    const applicationsWithStats: ApplicationWithStats[] = await Promise.all(
      (data || []).map(async (app) => {
        // Count categories via junction table
        const { count: categoryCount } = await supabase
          .from('application_categories')
          .select('*', { count: 'exact', head: true })
          .eq('application_id', app.id)

        // Count products via product_categories (products can belong to categories)
        // Get all category IDs for this application
        const { data: appCategories } = await supabase
          .from('application_categories')
          .select('category_id')
          .eq('application_id', app.id)

        let productCount = 0
        if (appCategories && appCategories.length > 0) {
          const categoryIds = appCategories.map(ac => ac.category_id)

          // Count unique products in these categories
          const { data: productCategories } = await supabase
            .from('product_categories')
            .select('product_id')
            .in('category_id', categoryIds)

          // Get unique product IDs
          const uniqueProductIds = [...new Set((productCategories || []).map(pc => pc.product_id))]
          productCount = uniqueProductIds.length
        }

        return {
          ...app,
          category_count: categoryCount || 0,
          product_count: productCount
        }
      })
    )

    return {
      applications: applicationsWithStats,
      success: true,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
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
    const supabase = ensureSupabase(createServerSupabaseClient())

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('type', 'application')
      .single()

    if (error) throw error

    // Get category count via junction table
    const { count: categoryCount } = await supabase
      .from('application_categories')
      .select('*', { count: 'exact', head: true })
      .eq('application_id', id)

    // Get product count
    const { data: appCategories } = await supabase
      .from('application_categories')
      .select('category_id')
      .eq('application_id', id)

    let productCount = 0
    if (appCategories && appCategories.length > 0) {
      const categoryIds = appCategories.map(ac => ac.category_id)
      const { data: productCategories } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', categoryIds)
      const uniqueProductIds = [...new Set((productCategories || []).map(pc => pc.product_id))]
      productCount = uniqueProductIds.length
    }

    const application: ApplicationWithStats = {
      ...data,
      category_count: categoryCount || 0,
      product_count: productCount
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
    const supabase = ensureSupabase(createServerSupabaseClient())

    const { data, error } = await supabase
      .from('categories')
      .insert({
        title: formData.name,
        slug: formData.slug,
        description: formData.description,
        type: 'application', // Set type as application
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
    const supabase = ensureSupabase(createServerSupabaseClient())

    const updateData: any = {
      ...formData,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('type', 'application')
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
    const supabase = ensureSupabase(createServerSupabaseClient())

    // Check if application has categories via junction table
    const { count: categoryCount } = await supabase
      .from('application_categories')
      .select('*', { count: 'exact', head: true })
      .eq('application_id', id)

    if (categoryCount && categoryCount > 0) {
      return {
        success: false,
        error: `Cannot delete application with ${categoryCount} categories. Remove category assignments first.`
      }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('type', 'application')

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
    const supabase = ensureSupabase(createServerSupabaseClient())

    // Total applications
    const { count: total } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'application')

    // Active applications
    const { count: active } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'application')
      .eq('is_active', true)

    // Get all application IDs
    const { data: applications } = await supabase
      .from('categories')
      .select('id')
      .eq('type', 'application')

    const appIds = (applications || []).map((app: any) => app.id)

    // Total categories via junction table
    const { count: totalCategories } = await supabase
      .from('application_categories')
      .select('*', { count: 'exact', head: true })
      .in('application_id', appIds)

    // Total products (unique across all categories in these applications)
    let totalProducts = 0
    if (appIds.length > 0) {
      const { data: appCats } = await supabase
        .from('application_categories')
        .select('category_id')
        .in('application_id', appIds)

      if (appCats && appCats.length > 0) {
        const categoryIds = appCats.map((ac: any) => ac.category_id)
        const { data: prodCats } = await supabase
          .from('product_categories')
          .select('product_id')
          .in('category_id', categoryIds)
        const uniqueProductIds = [...new Set((prodCats || []).map((pc: any) => pc.product_id))]
        totalProducts = uniqueProductIds.length
      }
    }

    return {
      total: total || 0,
      active: active || 0,
      inactive: (total || 0) - (active || 0),
      total_categories: totalCategories || 0,
      total_subcategories: 0, // Not applicable with junction tables
      total_products: totalProducts
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
    const supabase = ensureSupabase(createServerSupabaseClient())

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

