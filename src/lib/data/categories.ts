import { getSupabaseClient } from "@/lib/supabase/client"
import { ProductCategory } from "@/lib/types/domain"


/**
 * List categories from Supabase
 */
export async function listCategories(params?: {
  parent_id?: string | null
  include_descendants_tree?: boolean
}): Promise<ProductCategory[]> {

  // Fetch from Supabase
  try {
    const supabase = getSupabaseClient()
    let query = supabase
      .from('categories')
      .select('*')

    if (params?.parent_id !== undefined) {
      if (params.parent_id === null) {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', params.parent_id)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    let categories = data as ProductCategory[]

    if (params?.include_descendants_tree) {
      // Basic tree building - fetch all and build structure
    }

    return categories
  } catch (error) {
    console.error("Error fetching categories from Supabase:", error)
    return []
  }
}

/**
 * Get a single category
 */
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
      // Use slug field (categories table doesn't have handle field)
      query = query.eq('slug', idOrHandle)
    }

    const { data, error } = await query.single()

    if (error || !data) return null

    // Map slug to handle for compatibility with ProductCategory interface
    return {
      ...data,
      handle: data.slug, // Map slug to handle
      slug: data.slug
    } as ProductCategory
  } catch (error) {
    console.error("Error fetching category from Supabase:", error)
    return null
  }
}
