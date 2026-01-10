'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import type { ElevatorType, ElevatorTypeFormData, ElevatorTypeWithStats } from '@/lib/types/elevator-types'

// =============================================
// GET ALL ELEVATOR TYPES
// =============================================

export async function getElevatorTypes() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('elevator_types')
      .select('*')
      .order('title', { ascending: true })

    if (error) throw error

    // Enhance with product counts from junction table
    const elevatorTypesWithStats: ElevatorTypeWithStats[] = await Promise.all(
      (data || []).map(async (type) => {
        const { count } = await supabase
          .from('product_elevator_types')
          .select('*', { count: 'exact', head: true })
          .eq('elevator_type_id', type.id)

        return {
          ...type,
          product_count: count || 0
        }
      })
    )

    return { elevatorTypes: elevatorTypesWithStats, success: true }
  } catch (error) {
    console.error('Error fetching elevator types:', error)
    return { elevatorTypes: [], error: 'Failed to fetch elevator types', success: false }
  }
}

// =============================================
// GET ELEVATOR TYPE BY ID
// =============================================

export async function getElevatorTypeById(id: string) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('elevator_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    // Get product count from junction table
    const { count: productCount } = await supabase
      .from('product_elevator_types')
      .select('*', { count: 'exact', head: true })
      .eq('elevator_type_id', id)

    const elevatorType: ElevatorTypeWithStats = {
      ...data,
      product_count: productCount || 0
    }

    return { elevatorType, success: true }
  } catch (error) {
    console.error('Error fetching elevator type:', error)
    return { elevatorType: null, error: 'Failed to fetch elevator type', success: false }
  }
}

// =============================================
// GET ELEVATOR TYPE BY SLUG
// =============================================

export async function getElevatorTypeBySlug(slug: string) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('elevator_types')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error

    // Get product count from junction table
    const { count: productCount } = await supabase
      .from('product_elevator_types')
      .select('*', { count: 'exact', head: true })
      .eq('elevator_type_id', data.id)

    const elevatorType: ElevatorTypeWithStats = {
      ...data,
      product_count: productCount || 0
    }

    return { elevatorType, success: true }
  } catch (error) {
    console.error('Error fetching elevator type by slug:', error)
    return { elevatorType: null, error: 'Failed to fetch elevator type', success: false }
  }
}

// =============================================
// CREATE ELEVATOR TYPE
// =============================================

export async function createElevatorType(formData: ElevatorTypeFormData) {
  try {
    const supabase = createAdminClient()

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
      title: formData.title,
      subtitle: formData.subtitle,
      slug: formData.slug,
      description: formData.description,
      thumbnail_image: formData.thumbnail_image,
      banner_image: formData.banner_image,
      status: formData.status || 'active',
      meta_title: formData.meta_title,
      meta_description: formData.meta_description
    }

    const { data, error } = await supabase
      .from('elevator_types')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/elevator-types')

    return { success: true, elevatorType: data as ElevatorType }
  } catch (error) {
    console.error('Error creating elevator type:', error)
    return { success: false, error: 'Failed to create elevator type' }
  }
}

// =============================================
// UPDATE ELEVATOR TYPE
// =============================================

export async function updateElevatorType(id: string, formData: Partial<ElevatorTypeFormData>) {
  try {
    const supabase = createAdminClient()

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

    const updateData: any = { ...formData }

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const { data, error } = await supabase
      .from('elevator_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/elevator-types')
    revalidatePath(`/admin/elevator-types/${id}`)

    return { success: true, elevatorType: data as ElevatorType }
  } catch (error) {
    console.error('Error updating elevator type:', error)
    return { success: false, error: 'Failed to update elevator type' }
  }
}

// =============================================
// DELETE ELEVATOR TYPE
// =============================================

export async function deleteElevatorType(id: string) {
  try {
    const supabase = createAdminClient()

    // Check if there are products associated with this elevator type via junction table
    const { count } = await supabase
      .from('product_elevator_types')
      .select('*', { count: 'exact', head: true })
      .eq('elevator_type_id', id)

    if (count && count > 0) {
      return { success: false, error: `Cannot delete: ${count} products are assigned to this elevator type` }
    }

    const { error } = await supabase
      .from('elevator_types')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/elevator-types')

    return { success: true }
  } catch (error) {
    console.error('Error deleting elevator type:', error)
    return { success: false, error: 'Failed to delete elevator type' }
  }
}

// =============================================
// UPLOAD ELEVATOR TYPE IMAGE
// =============================================

export async function uploadElevatorTypeImage(file: File) {
  try {
    const { uploadToCloudinary } = await import('@/lib/cloudinary/upload')

    const result = await uploadToCloudinary(file, 'cedar/elevator-types')

    if (!result.success || !result.url) {
      throw new Error(result.error || 'Failed to upload image')
    }

    return { success: true, url: result.url }
  } catch (error: any) {
    console.error('Error uploading elevator type image:', error)
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

// =============================================
// GET ELEVATOR TYPE STATS
// =============================================

export async function getElevatorTypeStats() {
  try {
    const supabase = createAdminClient()

    const { count: totalCount } = await supabase
      .from('elevator_types')
      .select('*', { count: 'exact', head: true })

    const { count: activeCount } = await supabase
      .from('elevator_types')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return {
      success: true,
      stats: {
        total: totalCount || 0,
        active: activeCount || 0,
        inactive: (totalCount || 0) - (activeCount || 0)
      }
    }
  } catch (error) {
    console.error('Error fetching elevator type stats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}

// =============================================
// GET PRODUCTS FOR ELEVATOR TYPE
// =============================================

export async function getProductsForElevatorType(id: string) {
  try {
    const supabase = createAdminClient()

    // Query product_elevator_types to get related product IDs
    const { data: relations, error: relationError } = await supabase
      .from('product_elevator_types')
      .select('product_id')
      .eq('elevator_type_id', id)

    // Fallback if table doesn't exist or is empty, try querying products directly if schema allows
    // But for now assuming product_elevator_types is the way

    // If relationError, we might want to check products table directly as fallback?
    // Let's stick to relation table first.
    if (relationError) {
      // If relation table fails, try direct query on products table (legacy/alternative schema)
      const { data: directProducts, error: directError } = await supabase
        .from('products')
        .select('*')
        .eq('elevator_type_id', id)

      if (directError) throw relationError // Throw original error if both fail

      return { products: directProducts || [], success: true }
    }

    const productIds = relations?.map(r => r.product_id) || []

    if (productIds.length === 0) {
      // Also check direct query just in case junction table is empty but direct column has data?
      // This might be overkill and lead to duplicates if logic is mixed.
      // Let's just return empty for now.
      return { products: [], success: true }
    }

    // Fetch actual products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (productsError) throw productsError

    return { products, success: true }
  } catch (error) {
    console.error('Error fetching elevator type products:', error)
    return { products: [], error: 'Failed to fetch products', success: false }
  }
}
