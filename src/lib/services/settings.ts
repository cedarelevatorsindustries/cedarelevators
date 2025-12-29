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
// PAYMENT SETTINGS
// =====================================================

/**
 * Get payment settings
 */
export async function getPaymentSettings(): Promise<{
    success: boolean
    data?: PaymentSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('payment_settings')
            .select('*')
            .single()

        if (error) {
            console.error('Error fetching payment settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as PaymentSettings }
    } catch (error: any) {
        console.error('Error in getPaymentSettings:', error)
        return { success: false, error: error.message || 'Failed to fetch payment settings' }
    }
}

/**
 * Update payment settings
 */
export async function updatePaymentSettings(
    id: string,
    updates: UpdatePaymentSettingsData
): Promise<{
    success: boolean
    data?: PaymentSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('payment_settings')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating payment settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as PaymentSettings }
    } catch (error: any) {
        console.error('Error in updatePaymentSettings:', error)
        return { success: false, error: error.message || 'Failed to update payment settings' }
    }
}

// =====================================================
// TAX SETTINGS
// =====================================================

/**
 * Get tax settings
 */
export async function getTaxSettings(): Promise<{
    success: boolean
    data?: TaxSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('tax_settings')
            .select('*')
            .single()

        if (error) {
            console.error('Error fetching tax settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as TaxSettings }
    } catch (error: any) {
        console.error('Error in getTaxSettings:', error)
        return { success: false, error: error.message || 'Failed to fetch tax settings' }
    }
}

/**
 * Update tax settings
 */
export async function updateTaxSettings(
    id: string,
    updates: UpdateTaxSettingsData
): Promise<{
    success: boolean
    data?: TaxSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('tax_settings')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating tax settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as TaxSettings }
    } catch (error: any) {
        console.error('Error in updateTaxSettings:', error)
        return { success: false, error: error.message || 'Failed to update tax settings' }
    }
}

// =====================================================
// SHIPPING SETTINGS
// =====================================================

/**
 * Get shipping settings
 */
export async function getShippingSettings(): Promise<{
    success: boolean
    data?: ShippingSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('shipping_settings')
            .select('*')
            .single()

        if (error) {
            console.error('Error fetching shipping settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as ShippingSettings }
    } catch (error: any) {
        console.error('Error in getShippingSettings:', error)
        return { success: false, error: error.message || 'Failed to fetch shipping settings' }
    }
}

/**
 * Update shipping settings
 */
export async function updateShippingSettings(
    id: string,
    updates: UpdateShippingSettingsData
): Promise<{
    success: boolean
    data?: ShippingSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('shipping_settings')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating shipping settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as ShippingSettings }
    } catch (error: any) {
        console.error('Error in updateShippingSettings:', error)
        return { success: false, error: error.message || 'Failed to update shipping settings' }
    }
}

// =====================================================
// SYSTEM SETTINGS
// =====================================================

/**
 * Get system settings
 */
export async function getSystemSettings(): Promise<{
    success: boolean
    data?: SystemSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .single()

        if (error) {
            console.error('Error fetching system settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as SystemSettings }
    } catch (error: any) {
        console.error('Error in getSystemSettings:', error)
        return { success: false, error: error.message || 'Failed to fetch system settings' }
    }
}

/**
 * Update system settings
 */
export async function updateSystemSettings(
    id: string,
    updates: UpdateSystemSettingsData
): Promise<{
    success: boolean
    data?: SystemSettings
    error?: string
}> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('system_settings')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating system settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data as SystemSettings }
    } catch (error: any) {
        console.error('Error in updateSystemSettings:', error)
        return { success: false, error: error.message || 'Failed to update system settings' }
    }
}

// =====================================================
// SETTINGS SERVICE CLASS (for backward compatibility)
// =====================================================

export const SettingsService = {
    getPaymentSettings,
    updatePaymentSettings,
    getTaxSettings,
    updateTaxSettings,
    getShippingSettings,
    updateShippingSettings,
    getSystemSettings,
    updateSystemSettings,
    getStoreSettings,
    updateStoreSettings,
    initializeStoreSettings,
}


