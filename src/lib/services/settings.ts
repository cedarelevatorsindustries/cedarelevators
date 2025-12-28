'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { 
    StoreSettings, 
    UpdateStoreSettingsData,
    PaymentSettings,
    UpdatePaymentSettingsData,
    TaxSettings,
    UpdateTaxSettingsData,
    ShippingSettings,
    UpdateShippingSettingsData,
    SystemSettings,
    UpdateSystemSettingsData
} from '@/lib/types/settings'

/**
 * Settings Service - Server Actions
 * Individual async functions for managing all admin settings modules
 */

/**
 * Get store settings
 */
export async function getStoreSettings(): Promise<{
    success: boolean
    data?: StoreSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .single()

        if (error) {
            console.error('Error fetching store settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as StoreSettings }
    } catch (error: any) {
        console.error('Error in getStoreSettings:', error)
        return { success: false, error: error.message || 'Failed to fetch settings' }
    }
}

/**
 * Update store settings
 */
export async function updateStoreSettings(
    id: string,
    updates: UpdateStoreSettingsData
): Promise<{
    success: boolean
    data?: StoreSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('store_settings')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating store settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as StoreSettings }
    } catch (error: any) {
        console.error('Error in updateStoreSettings:', error)
        return { success: false, error: error.message || 'Failed to update settings' }
    }
}

/**
 * Initialize store settings (create default settings if none exist)
 */
export async function initializeStoreSettings(): Promise<{
    success: boolean
    data?: StoreSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        // Check if settings already exist
        const { data: existing } = await supabase
            .from('store_settings')
            .select('*')
            .single()

        if (existing) {
            return { success: true, data: existing as StoreSettings }
        }

        // Create default settings
        const { data, error } = await supabase
            .from('store_settings')
            .insert({
                store_name: 'Cedar Elevators',
                invoice_prefix: 'CE',
                currency: 'INR',
                timezone: 'Asia/Kolkata',
            })
            .select()
            .single()

        if (error) {
            console.error('Error initializing store settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as StoreSettings }
    } catch (error: any) {
        console.error('Error in initializeStoreSettings:', error)
        return { success: false, error: error.message || 'Failed to initialize settings' }
    }
}
