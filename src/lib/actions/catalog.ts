"use server"

import { createClient } from "@/lib/supabase/server"

export async function getApplications() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return { success: false, error: error.message }
  }
}

export async function getCategories(applicationId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('application_id', applicationId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return { success: false, error: error.message }
  }
}

export async function getSubcategories(categoryId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching subcategories:', error)
    return { success: false, error: error.message }
  }
}

export async function getElevatorTypes() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('elevator_types')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching elevator types:', error)
    return { success: false, error: error.message }
  }
}

export async function getCollections() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('title')

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching collections:', error)
    return { success: false, error: error.message }
  }
}
