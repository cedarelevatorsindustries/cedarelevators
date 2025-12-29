import { getSupabaseClient } from "@/lib/supabase/client"

export interface Application {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  thumbnail_image?: string
  banner_image?: string
  image_alt?: string
  icon?: string
  sort_order: number
  is_active: boolean
  status: string
  created_at: string
  updated_at: string
}

/**
 * List all active applications (categories with parent_id = NULL) for public display
 */
export async function listApplications(): Promise<Application[]> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error("Error fetching applications:", error)
      return []
    }

    return (data as Application[]) || []
  } catch (error) {
    console.error("Error fetching applications from Supabase:", error)
    return []
  }
}

/**
 * Get a single application by slug
 */
export async function getApplicationBySlug(slug: string): Promise<Application | null> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .is('parent_id', null)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return data as Application
  } catch (error) {
    console.error("Error fetching application by slug:", error)
    return null
  }
}
