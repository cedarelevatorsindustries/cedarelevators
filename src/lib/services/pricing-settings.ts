'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export interface PricingSettings {
  id: string
  guest_price_visible: boolean
  individual_price_visible: boolean
  business_unverified_price_visible: boolean
  business_verified_price_visible: boolean
  business_verified_can_buy: boolean
  bulk_pricing_enabled: boolean
  minimum_order_quantity: number
  discount_cap_percentage: number
  created_at: string
  updated_at: string
}

export interface UpdatePricingSettingsData {
  guest_price_visible?: boolean
  individual_price_visible?: boolean
  business_unverified_price_visible?: boolean
  business_verified_price_visible?: boolean
  business_verified_can_buy?: boolean
  bulk_pricing_enabled?: boolean
  minimum_order_quantity?: number
  discount_cap_percentage?: number
}

/**
 * Get pricing settings
 */
export async function getPricingSettings(): Promise<{
  success: boolean
  data?: PricingSettings
  error?: string
}> {
  try {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('pricing_settings')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching pricing settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as PricingSettings }
  } catch (error: any) {
    console.error('Error in getPricingSettings:', error)
    return { success: false, error: error.message || 'Failed to fetch pricing settings' }
  }
}

/**
 * Update pricing settings
 */
export async function updatePricingSettings(
  id: string,
  updates: UpdatePricingSettingsData
): Promise<{
  success: boolean
  data?: PricingSettings
  error?: string
}> {
  try {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('pricing_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating pricing settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as PricingSettings }
  } catch (error: any) {
    console.error('Error in updatePricingSettings:', error)
    return { success: false, error: error.message || 'Failed to update pricing settings' }
  }
}

/**
 * Initialize pricing settings (create default settings if none exist)
 */
export async function initializePricingSettings(): Promise<{
  success: boolean
  data?: PricingSettings
  error?: string
}> {
  try {
    const supabase = await createServerSupabase()

    // Check if settings already exist
    const { data: existing } = await supabase
      .from('pricing_settings')
      .select('*')
      .single()

    if (existing) {
      return { success: true, data: existing as PricingSettings }
    }

    // Create default settings
    const { data, error } = await supabase
      .from('pricing_settings')
      .insert({
        guest_price_visible: false,
        individual_price_visible: false,
        business_unverified_price_visible: true,
        business_verified_price_visible: true,
        business_verified_can_buy: true,
        bulk_pricing_enabled: true,
        minimum_order_quantity: 1,
        discount_cap_percentage: 15.0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pricing settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as PricingSettings }
  } catch (error: any) {
    console.error('Error in initializePricingSettings:', error)
    return { success: false, error: error.message || 'Failed to initialize pricing settings' }
  }
}

