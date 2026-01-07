"use server"

import { createServerSupabase } from "@/lib/supabase/server"

export async function getApplications() {
  try {
    console.log('getApplications: Initializing Supabase client...')
    const supabase = await createServerSupabase()
    console.log('getApplications: Client initialized. Fetching data...')

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'active')
      .order('title')

    if (error) {
      console.error('getApplications: Supabase error raw:', error)
      console.error('getApplications: Supabase error string:', JSON.stringify(error))
      throw error
    }

    console.log('getApplications: Success, rows:', data?.length)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

export async function getCategories(applicationId?: string) {
  try {
    const supabase = await createServerSupabase()

    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('title')

    // Only filter by application if provided
    if (applicationId && applicationId.trim() !== '') {
      query = query.eq('application', applicationId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return { success: false, error: error.message }
  }
}

export async function getSubcategories(categoryId: string) {
  try {
    const supabase = await createServerSupabase()

    // Get subcategory IDs from junction table
    const { data: junctionData, error: junctionError } = await supabase
      .from('category_subcategories')
      .select('subcategory_id')
      .eq('category_id', categoryId)

    if (junctionError) throw junctionError

    if (!junctionData || junctionData.length === 0) {
      return { success: true, data: [] }
    }

    const subcategoryIds = junctionData.map(j => j.subcategory_id)

    // Fetch subcategories from subcategories table
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .in('id', subcategoryIds)
      .eq('status', 'active')
      .order('title')

    if (error) throw error

    // Get product counts for each subcategory
    const subcategoriesWithCounts = await Promise.all(
      (data || []).map(async (subcat) => {
        const { count } = await supabase
          .from('product_subcategories')
          .select('*', { count: 'exact', head: true })
          .eq('subcategory_id', subcat.id)

        return {
          ...subcat,
          product_count: count || 0
        }
      })
    )

    return { success: true, data: subcategoriesWithCounts }
  } catch (error: any) {
    console.error('Error fetching subcategories:', error)
    return { success: false, error: error.message }
  }
}

export async function getElevatorTypes() {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('elevator_types')
      .select('*')
      .eq('status', 'active')
      .order('title')

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching elevator types:', error)
    return { success: false, error: error.message }
  }
}

export async function getCollections() {
  try {
    const supabase = await createServerSupabase()
    console.log('getCollections: Fetching collections...')

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('title')

    if (error) {
      console.error('getCollections: Error:', error)
      throw error
    }

    console.log('getCollections: Found', data?.length || 0, 'collections')
    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching collections:', error)
    return { success: false, error: error.message }
  }
}

