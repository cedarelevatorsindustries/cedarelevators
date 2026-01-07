"use server"

import { revalidatePath } from "next/cache"
import { createClerkSupabaseClient, createAdminClient } from "@/lib/supabase/server"
import type {
  Application,
  ApplicationWithStats,
  ApplicationFormData,
  ApplicationFilters,
  ApplicationStats
} from "@/lib/types/applications"

// Helper to ensure supabase client is not null
async function ensureSupabase() {
  const client = await createClerkSupabaseClient()
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
    const supabase = await ensureSupabase()

    // Calculate pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    // Get applications from applications table
    let query = supabase
      .from('applications')
      .select('*, slug:handle, thumbnail_image:thumbnail, banner_image:banner_url, meta_title:seo_meta_title, meta_description:seo_meta_description', { count: 'exact' })
      // Filter by type in metadata instead since type column doesn't exist
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

        // Parse metadata to enrich properties if needed
        const metadata = app.metadata || {}

        return {
          ...app,
          category_count: categoryCount || 0,
          product_count: productCount,
          image_alt: metadata.image_alt,
          icon: metadata.icon,
          badge_text: metadata.badge_text,
          badge_color: metadata.badge_color,
          image_url: metadata.image_url || app.image_url // fallback to column if exists
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
    const supabase = await ensureSupabase()

    const { data, error } = await supabase
      .from('applications')
      .select('*, slug:handle, thumbnail_image:thumbnail, banner_image:banner_url, meta_title:seo_meta_title, meta_description:seo_meta_description')
      .eq('id', id)
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
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('applications')
      .insert({
        title: formData.name,
        handle: formData.slug,
        subtitle: formData.subtitle,
        description: formData.description,
        thumbnail: formData.thumbnail_image,
        banner_url: formData.banner_image,
        is_active: formData.is_active !== false,
        status: formData.status || 'active',
        seo_meta_title: formData.meta_title,
        seo_meta_description: formData.meta_description,
        metadata: {
          image_alt: formData.image_alt,
          icon: formData.icon,
          badge_text: formData.badge_text,
          badge_color: formData.badge_color,
          image_url: formData.image_url,
          sort_order: formData.sort_order || 0
        }
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
    const supabase = createAdminClient()

    // Map Partial<ApplicationFormData> to DB columns
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    }

    if (formData.name !== undefined) updatePayload.title = formData.name
    if (formData.slug !== undefined) updatePayload.handle = formData.slug
    if (formData.description !== undefined) updatePayload.description = formData.description
    if (formData.thumbnail_image !== undefined) updatePayload.thumbnail = formData.thumbnail_image
    if (formData.banner_image !== undefined) updatePayload.banner_url = formData.banner_image
    if (formData.is_active !== undefined) updatePayload.is_active = formData.is_active
    if (formData.status !== undefined) updatePayload.status = formData.status
    if (formData.meta_title !== undefined) updatePayload.seo_meta_title = formData.meta_title
    if (formData.meta_description !== undefined) updatePayload.seo_meta_description = formData.meta_description

    // Handle metadata updates - need to merge or overwrite? 
    // Usually overwrite or we need to fetch existing first. 
    // For now simple overwrite of keys if present
    const metadataUpdates: any = {}
    if (formData.image_alt !== undefined) metadataUpdates.image_alt = formData.image_alt
    if (formData.icon !== undefined) metadataUpdates.icon = formData.icon
    if (formData.badge_text !== undefined) metadataUpdates.badge_text = formData.badge_text
    if (formData.badge_color !== undefined) metadataUpdates.badge_color = formData.badge_color
    if (formData.sort_order !== undefined) metadataUpdates.sort_order = formData.sort_order
    if (formData.image_url !== undefined) metadataUpdates.image_url = formData.image_url

    // If we have metadata updates, we might want to be careful not to wipe existing metadata
    // But since this is a partial update, we trust the caller. 
    // Ideally we jsonb_set or merge. For simplicity, we'll assume we can merge into existing metadata column if we could.
    // Since we can't easily doing deep merge in one UPDATE call without raw SQL or fetch-update, 
    // we will check if we have metadata updates. if so, we might need to fetch first?
    // Let's just put them in 'metadata' column. 
    // WARNING: This replaces the metadata object if we just say metadata: {...}. 
    // To do a merge: metadata: supabase.raw(`metadata || '${JSON.stringify(metadataUpdates)}'`) - but this requires .raw which might not be exposed easily on update helper?
    // Let's stick to simple mapping for now. The safe way is to just update what we have.

    if (Object.keys(metadataUpdates).length > 0) {
      // Fetch existing to merge
      const { data: existing } = await supabase.from('applications').select('metadata').eq('id', id).single()
      updatePayload.metadata = { ...(existing?.metadata || {}), ...metadataUpdates }
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updatePayload)
      .eq('id', id)
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
    const supabase = createAdminClient()

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
      .from('applications')
      .delete()
      .eq('id', id)

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
    const supabase = await ensureSupabase()

    // Total applications
    const { count: total } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })

    // Active applications
    const { count: active } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get all application IDs
    const { data: applications } = await supabase
      .from('applications')
      .select('id')

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
    const supabase = createAdminClient()

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

