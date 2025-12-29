"use server"

import { revalidatePath } from "next/cache"
import { createClerkSupabaseClient } from "@/lib/supabase/server"
import type {
  Category,
  CategoryWithChildren,
  CategoryFormData,
  CategoryFilters,
  CategoryStats,
  CategoryLevel
} from "@/lib/types/categories"

// =============================================
// GET CATEGORIES
// =============================================

export async function getCategories(filters?: CategoryFilters) {
  try {
    const supabase = await createClerkSupabaseClient()

    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    // Apply filters
    if (filters?.parent_id !== undefined) {
      if (filters.parent_id === null) {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', filters.parent_id)
      }
    }

    if (filters?.application) {
      query = query.eq('application', filters.application)
    }

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

    // Build hierarchy if no parent_id filter
    if (filters?.parent_id === undefined) {
      const categories = buildCategoryTree(data || [])
      const stats = await getCategoryStats()
      return { categories, stats, success: true }
    }

    return { categories: data || [], success: true }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { categories: [], error: 'Failed to fetch categories', success: false }
  }
}

// =============================================
// GET CATEGORY BY ID
// =============================================

export async function getCategoryById(id: string) {
  try {
    const supabase = await createClerkSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    // Get product count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', id)

    const category: CategoryWithChildren = {
      ...data,
      product_count: count || 0
    }

    return { category, success: true }
  } catch (error) {
    console.error('Error fetching category:', error)
    return { category: null, error: 'Failed to fetch category', success: false }
  }
}

// =============================================
// GET CATEGORY BY SLUG
// =============================================

export async function getCategoryBySlug(slug: string) {
  try {
    const supabase = await createClerkSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error

    return { category: data, success: true }
  } catch (error) {
    console.error('Error fetching category:', error)
    return { category: null, error: 'Failed to fetch category', success: false }
  }
}

// =============================================
// CREATE CATEGORY
// =============================================

export async function createCategory(formData: CategoryFormData) {
  try {
    const supabase = await createClerkSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parent_id: formData.parent_id || null,
        image_url: formData.image_url, // DEPRECATED: Use thumbnail_image instead
        thumbnail_image: formData.thumbnail_image,
        banner_image: formData.banner_image,
        image_alt: formData.image_alt,
        icon: formData.icon,
        sort_order: formData.sort_order || 0,
        is_active: formData.is_active !== false,
        status: formData.status || 'active',
        application: formData.application,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/categories')
    revalidatePath('/')

    return { category: data, success: true }
  } catch (error: any) {
    console.error('Error creating category:', error)
    return {
      category: null,
      error: error.message || 'Failed to create category',
      success: false
    }
  }
}

// =============================================
// UPDATE CATEGORY
// =============================================

export async function updateCategory(id: string, formData: Partial<CategoryFormData>) {
  try {
    const supabase = await createClerkSupabaseClient()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (formData.name !== undefined) updateData.name = formData.name
    if (formData.slug !== undefined) updateData.slug = formData.slug
    if (formData.description !== undefined) updateData.description = formData.description
    if (formData.parent_id !== undefined) updateData.parent_id = formData.parent_id
    if (formData.image_url !== undefined) updateData.image_url = formData.image_url // DEPRECATED
    if (formData.thumbnail_image !== undefined) updateData.thumbnail_image = formData.thumbnail_image
    if (formData.banner_image !== undefined) updateData.banner_image = formData.banner_image
    if (formData.image_alt !== undefined) updateData.image_alt = formData.image_alt
    if (formData.icon !== undefined) updateData.icon = formData.icon
    if (formData.sort_order !== undefined) updateData.sort_order = formData.sort_order
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active
    if (formData.status !== undefined) updateData.status = formData.status
    if (formData.application !== undefined) updateData.application = formData.application
    if (formData.meta_title !== undefined) updateData.meta_title = formData.meta_title
    if (formData.meta_description !== undefined) updateData.meta_description = formData.meta_description

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/categories')
    revalidatePath('/')

    return { category: data, success: true }
  } catch (error: any) {
    console.error('Error updating category:', error)
    return {
      category: null,
      error: error.message || 'Failed to update category',
      success: false
    }
  }
}

// =============================================
// DELETE CATEGORY
// =============================================

export async function deleteCategory(id: string) {
  try {
    const supabase = await createClerkSupabaseClient()

    // Check if category has children
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id)

    if (count && count > 0) {
      return {
        success: false,
        error: 'Cannot delete category with subcategories. Please delete subcategories first.'
      }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/categories')
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete category'
    }
  }
}

// =============================================
// UPLOAD CATEGORY IMAGE
// =============================================

export async function uploadCategoryImage(file: File) {
  try {
    const supabase = await createClerkSupabaseClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('categories')
      .getPublicUrl(filePath)

    return { url: publicUrl, success: true }
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
// GET CATEGORY STATS
// =============================================

export async function getCategoryStats(): Promise<CategoryStats> {
  try {
    const supabase = await createClerkSupabaseClient()

    const { count: total } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    const { count: active } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: applications } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .is('parent_id', null)

    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    // Count categories (mid-level) and subcategories
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, parent_id')

    const parentIds = new Set(allCategories?.filter(c => c.parent_id === null).map(c => c.id) || [])
    const categories = allCategories?.filter(c => c.parent_id && parentIds.has(c.parent_id)).length || 0
    const subcategories = allCategories?.filter(c => c.parent_id && !parentIds.has(c.parent_id)).length || 0

    return {
      total: total || 0,
      active: active || 0,
      applications: applications || 0,
      categories,
      subcategories,
      total_products: totalProducts || 0
    }
  } catch (error) {
    console.error('Error fetching category stats:', error)
    return {
      total: 0,
      active: 0,
      applications: 0,
      categories: 0,
      subcategories: 0,
      total_products: 0
    }
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>()
  const rootCategories: CategoryWithChildren[] = []

  // Create map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // Build tree
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!

    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(categoryWithChildren)
      }
    } else {
      rootCategories.push(categoryWithChildren)
    }
  })

  return rootCategories
}
