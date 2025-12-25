/**
 * Settings Types
 * TypeScript interfaces for store settings
 */

export interface StoreSettings {
    id: string
    store_name: string
    legal_name: string | null
    description: string | null
    logo_url: string | null
    support_email: string | null
    support_phone: string | null
    gst_number: string | null
    invoice_prefix: string
    currency: string
    timezone: string
    created_at: string
    updated_at: string
}

export interface UpdateStoreSettingsData {
    store_name: string
    legal_name?: string
    description?: string
    logo_url?: string
    support_email?: string
    support_phone?: string
    gst_number?: string
    invoice_prefix: string
    currency: string
    timezone: string
}
