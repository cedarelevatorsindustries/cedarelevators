import { getSupabaseClient } from "@/lib/supabase/client"
import { ProductCategory } from "@/lib/types/domain"


/**
 * List categories from Supabase
 * Note: Categories table doesn't have parent_id - use junction tables for relationships
 */
export async function listCategories(params?: {
  parent_id?: string | null  // Kept for compatibility but not used
  include_descendants_tree?: boolean
}): Promise<ProductCategory[]> {

  // Fetch from Supabase
  try {
    const supabase = getSupabaseClient()
    let query = supabase
      .from('categories')
      .select('*')

    // Note: parent_id doesn't exist in categories table
    // Applications, categories, and subcategories are all in categories table
    // Relationships are managed via junction tables (application_categories, category_subcategories)

    const { data, error } = await query

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    let categories = data.map((cat: any) => ({
      ...cat,
      handle: cat.handle || cat.slug,  // Ensure handle exists
      name: cat.title  // Map title to name for compatibility
    })) as ProductCategory[]

    if (params?.include_descendants_tree) {
      // Basic tree building would require junction table queries
      // For now, return flat list
    }

    return categories
  } catch (error) {
    console.error("Error fetching categories from Supabase:", error)
    return []
  }
}

export async function getCategory(idOrHandle: string): Promise<ProductCategory | null> {

  // Fetch from Supabase
  try {
    const supabase = getSupabaseClient()

    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrHandle)

    let query = supabase
      .from('categories')
      .select('*')

    if (isId) {
      query = query.eq('id', idOrHandle)
    } else {
      // Try handle first, then slug
      query = query.or(`handle.eq.${idOrHandle},slug.eq.${idOrHandle}`)
    }

    const { data, error } = await query.maybeSingle()

    if (error || !data) return null

    // Map fields for compatibility with ProductCategory interface
    return {
      ...data,
      handle: data.handle || data.slug,
      name: data.title  // Map title to name
    } as ProductCategory
  } catch (error) {
    console.error("Error fetching category from Supabase:", error)
    return null
  }
}

