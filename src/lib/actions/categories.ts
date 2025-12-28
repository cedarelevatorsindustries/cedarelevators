'use server'

import { createServerSupabase, createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

/**
 * Create a new category
 */
export async function createCategory(data: {
  name: string
  slug: string
  description?: string
  parent_id?: string
  image_url?: string
  icon?: string
  sort_order?: number
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Validate required fields
    if (!data.name || !data.slug) {
      return { success: false, error: 'Name and slug are required' }
    }
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', data.slug)
      .single()
    
    if (existing) {
      return { success: false, error: 'Category with this slug already exists' }
    }
    
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        parent_id: data.parent_id || null,
        image_url: data.image_url,
        icon: data.icon,
        sort_order: data.sort_order || 0,
        is_active: true,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating category:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, category }
  } catch (error: any) {
    console.error('Error in createCategory:', error)
    return { success: false, error: error.message || 'Failed to create category' }
  }
}

/**
 * Update category
 */
export async function updateCategory(
  id: string,
  updates: Partial<{
    name: string
    slug: string
    description: string
    parent_id: string
    image_url: string
    icon: string
    sort_order: number
    is_active: boolean
  }>
) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // If slug is being updated, check uniqueness
    if (updates.slug) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', updates.slug)
        .neq('id', id)
        .single()
      
      if (existing) {
        return { success: false, error: 'Category with this slug already exists' }
      }
    }
    
    const { data: category, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating category:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, category }
  } catch (error: any) {
    console.error('Error in updateCategory:', error)
    return { success: false, error: error.message || 'Failed to update category' }
  }
}

/**
 * Delete category
 */
export async function deleteCategory(id: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Check if category has products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', id)
    
    if (count && count > 0) {
      return { 
        success: false, 
        error: `Cannot delete category with ${count} existing products. Please reassign or delete products first.` 
      }
    }
    
    // Check if category has subcategories
    const { count: subCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id)
    
    if (subCount && subCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete category with ${subCount} subcategories. Please delete subcategories first.` 
      }
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting category:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteCategory:', error)
    return { success: false, error: error.message || 'Failed to delete category' }
  }
}

/**
 * Get category tree structure
 */
export async function getCategoryTree() {
  try {
    const supabase = await createServerSupabase()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .order('name')
    
    if (error) {
      console.error('Error fetching categories:', error)
      return { success: false, error: error.message }
    }
    
    // Build tree structure
    const tree = categories?.filter(c => !c.parent_id).map(parent => ({
      ...parent,
      children: categories?.filter(c => c.parent_id === parent.id)
    }))
    
    return { success: true, tree }
  } catch (error: any) {
    console.error('Error in getCategoryTree:', error)
    return { success: false, error: error.message || 'Failed to fetch category tree' }
  }
}

/**
 * Get single category by ID
 */
export async function getCategoryById(id: string) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: category, error } = await supabase
      .from('categories')
      .select(`
        *,
        products:products(count),
        subcategories:categories!parent_id(count)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching category:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, category }
  } catch (error: any) {
    console.error('Error in getCategoryById:', error)
    return { success: false, error: error.message || 'Failed to fetch category' }
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) {
      console.error('Error fetching category:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, category }
  } catch (error: any) {
    console.error('Error in getCategoryBySlug:', error)
    return { success: false, error: error.message || 'Failed to fetch category' }
  }
}

/**
 * Fetch categories with filters
 */
export async function fetchCategories(filters?: {
  search?: string
  parent_id?: string
  is_active?: boolean
  limit?: number
}) {
  try {
    const supabase = await createServerSupabase()
    
    let query = supabase
      .from('categories')
      .select(`
        *,
        products:products(count)
      `)
      .order('sort_order')
      .order('name')
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    if (filters?.parent_id !== undefined) {
      if (filters.parent_id === null || filters.parent_id === '') {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', filters.parent_id)
      }
    }
    
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    const { data: categories, error } = await query
    
    if (error) {
      console.error('Error fetching categories:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, categories }
  } catch (error: any) {
    console.error('Error in fetchCategories:', error)
    return { success: false, error: error.message || 'Failed to fetch categories' }
  }
}

/**
 * Bulk update category sort order
 */
export async function updateCategorySortOrder(updates: { id: string; sort_order: number }[]) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Update each category's sort order
    const promises = updates.map(({ id, sort_order }) =>
      supabase
        .from('categories')
        .update({ sort_order })
        .eq('id', id)
    )
    
    await Promise.all(promises)
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in updateCategorySortOrder:', error)
    return { success: false, error: error.message || 'Failed to update sort order' }
  }
}
