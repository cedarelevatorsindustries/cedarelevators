'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type {
  ElevatorType,
  ElevatorTypeFormData,
  ElevatorTypeFilters,
  CreateElevatorTypeResult,
  UpdateElevatorTypeResult,
  FetchElevatorTypesResult,
  DeleteElevatorTypeResult,
} from '@/lib/types/elevator-types'

/**
 * Fetch all elevator types with optional filters
 */
export async function fetchElevatorTypes(
  filters?: ElevatorTypeFilters
): Promise<FetchElevatorTypesResult> {
  try {
    const supabase = await createServerSupabase()

    let query = supabase
      .from('elevator_types')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    // Apply filters
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching elevator types:', error)
      return { success: false, error: error.message }
    }

    return { success: true, elevatorTypes: data as ElevatorType[] }
  } catch (error: any) {
    console.error('Error in fetchElevatorTypes:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch single elevator type by ID
 */
export async function fetchElevatorTypeById(
  id: string
): Promise<UpdateElevatorTypeResult> {
  try {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('elevator_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching elevator type:', error)
      return { success: false, error: error.message }
    }

    return { success: true, elevatorType: data as ElevatorType }
  } catch (error: any) {
    console.error('Error in fetchElevatorTypeById:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create new elevator type
 */
export async function createElevatorType(
  formData: ElevatorTypeFormData
): Promise<CreateElevatorTypeResult> {
  try {
    const supabase = await createServerSupabase()

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('elevator_types')
      .select('id')
      .eq('slug', formData.slug)
      .single()

    if (existing) {
      return { success: false, error: 'Slug already exists' }
    }

    const insertData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      icon: formData.icon,
      thumbnail_image: formData.thumbnail_image,
      banner_image: formData.banner_image,
      sort_order: formData.sort_order,
      is_active: formData.is_active
    }

    const { data, error } = await supabase
      .from('elevator_types')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating elevator type:', error)
      return { success: false, error: error.message }
    }

    return { success: true, elevatorType: data as ElevatorType }
  } catch (error: any) {
    console.error('Error in createElevatorType:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update existing elevator type
 */
export async function updateElevatorType(
  id: string,
  formData: Partial<ElevatorTypeFormData>
): Promise<UpdateElevatorTypeResult> {
  try {
    const supabase = await createServerSupabase()

    // If slug is being updated, check uniqueness
    if (formData.slug) {
      const { data: existing } = await supabase
        .from('elevator_types')
        .select('id')
        .eq('slug', formData.slug)
        .neq('id', id)
        .single()

      if (existing) {
        return { success: false, error: 'Slug already exists' }
      }
    }

    const { data, error } = await supabase
      .from('elevator_types')
      .update(formData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating elevator type:', error)
      return { success: false, error: error.message }
    }

    return { success: true, elevatorType: data as ElevatorType }
  } catch (error: any) {
    console.error('Error in updateElevatorType:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete elevator type
 */
export async function deleteElevatorType(
  id: string
): Promise<DeleteElevatorTypeResult> {
  try {
    const supabase = await createServerSupabase()

    // Check if elevator type is in use by any products
    const { data: productsInUse } = await supabase
      .from('product_elevator_types')
      .select('id')
      .eq('elevator_type_id', id)
      .limit(1)

    if (productsInUse && productsInUse.length > 0) {
      return {
        success: false,
        error: 'Cannot delete elevator type that is assigned to products',
      }
    }

    const { error } = await supabase
      .from('elevator_types')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting elevator type:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteElevatorType:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Bulk update elevator types sort order
 */
export async function updateElevatorTypesOrder(
  updates: Array<{ id: string; sort_order: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase()

    const promises = updates.map((update) =>
      supabase
        .from('elevator_types')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)
    )

    const results = await Promise.all(promises)

    const hasError = results.some((result) => result.error)
    if (hasError) {
      return { success: false, error: 'Failed to update some elevator types' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateElevatorTypesOrder:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get products by elevator type
 */
export async function getProductsByElevatorType(
  elevatorTypeId: string
): Promise<{ success: boolean; products?: any[]; error?: string }> {
  try {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase.rpc('get_elevator_type_products', {
      elevator_type_id_param: elevatorTypeId,
    })

    if (error) {
      console.error('Error fetching products by elevator type:', error)
      return { success: false, error: error.message }
    }

    return { success: true, products: data }
  } catch (error: any) {
    console.error('Error in getProductsByElevatorType:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload elevator type image to Supabase Storage
 */
export async function uploadElevatorTypeImage(
  file: File,
  type: 'thumbnail' | 'banner' = 'thumbnail'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createServerSupabase()

    const fileExt = file.name.split('.').pop()
    const fileName = `${type}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('elevator-types')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('elevator-types')
      .getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error('Error uploading elevator type image:', error)
    return { success: false, error: error.message }
  }
}

