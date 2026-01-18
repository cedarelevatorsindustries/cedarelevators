"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCached } from "@/lib/cache/redis"
import { CACHE_KEYS, DEFAULT_TTL } from "@/lib/utils/cache-keys"
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
  // Generate cache key based on filters
  const cacheKey = CACHE_KEYS.CATEGORIES.LIST() + (filters ? `:${JSON.stringify(filters)}` : '')

  return getCached(
    cacheKey,
    async () => {
      return await getCategoriesUncached(filters)
    },
    DEFAULT_TTL.CATEGORIES // 1 hour
  )
}

async function getCategoriesUncached(filters?: CategoryFilters) {
  try {
    const supabase = ensureSupabase(createServerSupabaseClient())

    // Calculate pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .order('categories_card_position', { ascending: true, nullsFirst: false })
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

    // PERFORMANCE OPTIMIZATION: Batch fetch counts instead of N+1 queries
    const categoryIds = (data || []).map(c => c.id)

    // Helper to count items by key
    const countByKey = (items: any[], key: string) => {
      return items.reduce((acc, item) => {
        const keyValue = item[key]
        acc[keyValue] = (acc[keyValue] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    // Fetch all counts in parallel with 3 queries instead of N queries per category
    const [subcategoryData, productData, applicationData] = await Promise.all([
      supabase
        .from('category_subcategories')
        .select('category_id')
        .in('category_id', categoryIds),
      supabase
        .from('product_categories')
        .select('category_id')
        .in('category_id', categoryIds),
      supabase
        .from('application_categories')
        .select('category_id')
        .in('category_id', categoryIds)
    ])

    const subcategoryCounts = countByKey(subcategoryData.data || [], 'category_id')
    const productCounts = countByKey(productData.data || [], 'category_id')
    const applicationCounts = countByKey(applicationData.data || [], 'category_id')

    // Map counts to categories
    const categoriesWithStats = (data || []).map(category => ({
      ...category,
      name: category.title,
      subcategory_count: subcategoryCounts[category.id] || 0,
      product_count: productCounts[category.id] || 0,
      application_count: applicationCounts[category.id] || 0
    }))

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
  const cacheKey = CACHE_KEYS.CATEGORIES.DETAIL(id)

  return getCached(
    cacheKey,
    async () => {
      return await getCategoryByIdUncached(id)
    },
    DEFAULT_TTL.CATEGORIES
  )
}

async function getCategoryByIdUncached(id: string) {
  try {
    const supabase = ensureSupabase(createServerSupabaseClient())

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
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
      name: data.title, // Map database 'title' to 'name' for UI
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
  const cacheKey = CACHE_KEYS.CATEGORIES.BY_SLUG(slug)

  return getCached(
    cacheKey,
    async () => {
      return await getCategoryBySlugUncached(slug)
    },
    DEFAULT_TTL.CATEGORIES
  )
}

async function getCategoryBySlugUncached(slug: string) {
  try {
    const supabase = ensureSupabase(createServerSupabaseClient())

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error

    // Count subcategories via junction table
    const { count: subcategoryCount } = await supabase
      .from('category_subcategories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', data.id)

    // Count products via product_categories
    const { count: productCount } = await supabase
      .from('product_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', data.id)

    const category: CategoryWithChildren = {
      ...data,
      name: data.title, // Map database 'title' to 'name' for UI
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
// CREATE CATEGORY
// =============================================

export async function createCategory(formData: CategoryFormData) {
  try {
    const supabase = ensureSupabase(createServerSupabaseClient())

    // This function only creates top-level categories
    // For subcategories, use createSubcategory from subcategories.ts
    if (formData.parent_id) {
      // Import and use createSubcategory instead
      const { createSubcategory } = await import('./subcategories')
      return await createSubcategory(formData)
    }

    console.log('[createCategory] Creating category in categories table')

    const categoryData = {
      title: formData.name,
      handle: formData.slug,
      slug: formData.slug,
      description: formData.description,
      thumbnail: formData.thumbnail_image,
      banner_url: formData.banner_url,
      categories_card_position: formData.categories_card_position ? parseInt(String(formData.categories_card_position), 10) : null,
      icon: formData.icon,
      is_active: formData.is_active !== false,
      status: formData.status || 'active',
      seo_meta_title: formData.seo_meta_title,
      seo_meta_description: formData.seo_meta_description
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) throw error

    console.log('[createCategory] Created category:', data?.id)

    // Invalidate caches
    const { invalidateCache } = await import('@/lib/middleware/cache')
    await invalidateCache([
      'categories:*',
      'admin:*'
    ])

    revalidatePath('/admin/categories')
    revalidatePath('/')

    return { category: data, success: true, isSubcategory: false }
  } catch (error: any) {
    console.error('Error creating category:', error)
    return {
      category: null,
      error: error.message || 'Failed to create category',
      success: false,
      isSubcategory: false
    }
  }
}

// =============================================
// UPDATE CATEGORY
// =============================================

export async function updateCategory(id: string, formData: Partial<CategoryFormData>) {
  try {
    const supabase = ensureSupabase(createServerSupabaseClient())

    // This function only updates categories
    // For subcategories, use updateSubcategory from subcategories.ts

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Category fields
    if (formData.name !== undefined) updateData.title = formData.name
    if (formData.slug !== undefined) {
      updateData.slug = formData.slug
      updateData.handle = formData.slug
    }
    if (formData.description !== undefined) updateData.description = formData.description
    if (formData.thumbnail_image !== undefined) updateData.thumbnail = formData.thumbnail_image
    if (formData.banner_url !== undefined) updateData.banner_url = formData.banner_url
    if (formData.categories_card_position !== undefined) {
      updateData.categories_card_position = formData.categories_card_position ? parseInt(String(formData.categories_card_position), 10) : null
    }
    if (formData.icon !== undefined) updateData.icon = formData.icon
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active
    if (formData.status !== undefined) updateData.status = formData.status
    if (formData.seo_meta_title !== undefined) updateData.seo_meta_title = formData.seo_meta_title
    if (formData.seo_meta_description !== undefined) updateData.seo_meta_description = formData.seo_meta_description

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Invalidate caches
    const { invalidateCache } = await import('@/lib/middleware/cache')
    await invalidateCache([
      'categories:*',
      'admin:*'
    ])

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

    // Invalidate caches
    const { invalidateCache } = await import('@/lib/middleware/cache')
    await invalidateCache([
      'categories:*',
      'admin:*'
    ])

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
    const { uploadToCloudinary } = await import('@/lib/cloudinary/upload')

    const result = await uploadToCloudinary(file, 'cedar/categories')

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
// GET CATEGORY STATS
// =============================================

export async function getCategoryStats(): Promise<CategoryStats> {
  try {
    const supabase = ensureSupabase(createServerSupabaseClient())

    // Total categories
    const { count: total } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    // Active categories
    const { count: active } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Total applications - count from applications table instead
    const { count: applications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })

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


