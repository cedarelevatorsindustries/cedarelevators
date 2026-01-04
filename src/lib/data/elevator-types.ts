import { getSupabaseClient } from "@/lib/supabase/client"

export interface ElevatorType {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  thumbnail_image?: string
  banner_image?: string
  sort_order: number
  is_active: boolean
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
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

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
      .eq('is_active', true)
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

