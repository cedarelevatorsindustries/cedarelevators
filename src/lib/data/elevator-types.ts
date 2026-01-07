import { getSupabaseClient } from "@/lib/supabase/client"

export interface ElevatorType {
  id: string
  title: string
  slug: string
  subtitle?: string
  description?: string
  thumbnail_image?: string
  banner_image?: string
  status: 'active' | 'draft' | 'archived'
  created_at: string
  updated_at: string
}

/**
 * List all active elevator types for public display
 */
export async function listElevatorTypes(): Promise<ElevatorType[]> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('elevator_types')
      .select('*')
      .eq('status', 'active')
      .order('title', { ascending: true })

    if (error) {
      console.error("Error fetching elevator types:", error)
      return []
    }

    return (data as ElevatorType[]) || []
  } catch (error) {
    console.error("Error fetching elevator types from Supabase:", error)
    return []
  }
}

/**
 * Get a single elevator type by slug
 */
export async function getElevatorTypeBySlug(slug: string): Promise<ElevatorType | null> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('elevator_types')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return null
    }

    return data as ElevatorType
  } catch (error) {
    console.error("Error fetching elevator type by slug:", error)
    return null
  }
}
