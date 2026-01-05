"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type {
  Category,
  CategoryWithChildren,
  CategoryFormData,
  CategoryFilters,
  CategoryStats,
  CategoryLevel
} from "@/lib/types/categories"

// Helper to ensure supabase client is not null
function ensureSupabase(client: ReturnType<typeof createServerSupabaseClient>) {
  if (!client) {
    throw new Error('Failed to create Supabase client')
  }
  return client
}

// =============================================
// GET CATEGORIES
// =============================================

export async function getCategories(filters?: CategoryFilters) {
  try {
    const supabase = ensureSupabase(createServerSupabaseClient())

    // Calculate pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .eq('type', 'category') // Only get categories (not applications)
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

    // Enhance with stats for each category
    const categoriesWithStats = await Promise.all(
      (data || []).map(async (category) => {
        // Count subcategories via junction table
        const { count: subcategoryCount } = await supabase
          .from('category_subcategories')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)

        // Count products via product_categories
        const { count: productCount } = await supabase
          .from('product_categories')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)

        // Count applications using this category
        const { count: applicationCount } = await supabase
          .from('application_categories')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)

        return {
          ...category,
          subcategory_count: subcategoryCount || 0,
          product_count: productCount || 0,
          application_count: applicationCount || 0
        }
      })
    )

    const stats = await getCategoryStats()

    return {
      categories: categoriesWithStats,
      stats,
      success: true,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
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
    const supabase = ensureSupabase(createServerSupabaseClient())

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('type', 'category')
      .single()

    if (error) throw error

    // Count subcategories via junction table
    const { count: subcategoryCount } = await supabase
      .from('category_subcategories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    // Count products via product_categories
    const { count: productCount } = await supabase
      .from('product_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    const category: CategoryWithChildren = {
      ...data,
      subcategory_count: subcategoryCount || 0,
      product_count: productCount || 0
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
    const supabase = ensureSupabase(createServerSupabaseClient())

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
    const supabase = ensureSupabase(createServerSupabaseClient())

    const { data, error } = await supabase
      .from('categories')
      .insert({
        title: formData.name,
        slug: formData.slug,
        description: formData.description,
        type: 'category', // Set type as category
        image_url: formData.image_url,
        thumbnail_image: formData.thumbnail_image,
        banner_image: formData.banner_image,
        image_alt: formData.image_alt,
        icon: formData.icon,
        sort_order: formData.sort_order || 0,
        is_active: formData.is_active !== false,
        status: formData.status || 'active',
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
    const supabase = ensureSupabase(createServerSupabaseClient())

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
    const supabase = ensureSupabase(createServerSupabaseClient())

    // Check if category has subcategories via junction table
    const { count: subcategoryCount } = await supabase
      .from('category_subcategories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (subcategoryCount && subcategoryCount > 0) {
      return {
        success: false,
        error: 'Cannot delete category with subcategories. Remove subcategory assignments first.'
      }
    }

    // Check if category is used in applications
    const { count: applicationCount } = await supabase
      .from('application_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (applicationCount && applicationCount > 0) {
      return {
        success: false,
        error: 'Cannot delete category used in applications. Remove from applications first.'
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
    const supabase = ensureSupabase(createServerSupabaseClient())

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
    const supabase = ensureSupabase(createServerSupabaseClient())

    // Total categories
    const { count: total } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'category')

    // Active categories
    const { count: active } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'category')
      .eq('is_active', true)

    // Total applications
    const { count: applications } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'application')

    // Total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    // Count subcategories via junction table
    const { count: subcategories } = await supabase
      .from('category_subcategories')
      .select('*', { count: 'exact', head: true })

    return {
      total: total || 0,
      active: active || 0,
      applications: applications || 0,
      categories: total || 0, // Same as total since we're only counting categories
      subcategories: subcategories || 0,
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

// Backwards compatibility aliases
export const fetchCategories = getCategories
export const getCategoryTree = async () => {
  const result = await getCategories()
  return result.categories || []
}


