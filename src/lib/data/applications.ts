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
 * List all active applications for public display
 */
export async function listApplications(): Promise<Application[]> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'active')
      .order('id', { ascending: true })

    if (error) {
      console.error("Error fetching applications:", error)
      return []
    }

    // Map database fields to Application interface
    const applications = (data || []).map((app: any) => ({
      id: app.id,
      name: app.title, // Map title -> name
      slug: app.handle, // Map handle -> slug
      description: app.subtitle, // Map subtitle -> description
      image_url: app.banner_url,
      thumbnail_image: app.thumbnail,
      banner_image: app.banner_url,
      image_alt: app.title,
      icon: app.title?.toLowerCase(), // Use title as icon key
      sort_order: 0,
      is_active: app.status === 'active',
      status: app.status,
      created_at: app.created_at,
      updated_at: app.updated_at
    }))

    return applications
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
      .from('applications')
      .select('*')
      .eq('handle', slug) // Use handle instead of slug
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return null
    }

    // Map database fields to Application interface
    return {
      id: data.id,
      name: data.title,
      slug: data.handle,
      description: data.subtitle,
      image_url: data.banner_url,
      thumbnail_image: data.thumbnail,
      banner_image: data.banner_url,
      image_alt: data.title,
      icon: data.title?.toLowerCase(),
      sort_order: 0,
      is_active: data.status === 'active',
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  } catch (error) {
    console.error("Error fetching application by slug:", error)
    return null
  }
}
