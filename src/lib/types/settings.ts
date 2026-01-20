/**
 * Settings Types
 * TypeScript interfaces for all admin settings modules
 */

// =====================================================
// STORE SETTINGS
// =====================================================

export interface StoreSettings {
    id: string
    store_name: string
    legal_name?: string | null
    description?: string | null
    support_email: string | null
    support_phone: string | null
    gst_number?: string | null
    invoice_prefix: string
    whatsapp_number: string | null
    currency: string
    timezone: string
    about_cedar: string | null
    address_line1: string | null
    address_line2: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
    business_hours: Record<string, string> | null
    social_media: Record<string, string> | null
    created_at: string
    updated_at: string
}

export type UpdateStoreSettingsData = Partial<Omit<StoreSettings, 'id' | 'created_at' | 'updated_at'>>

// =====================================================
// PAYMENT SETTINGS
// =====================================================

export interface PaymentSettings {
    id: string
    razorpay_enabled: boolean
    bank_transfer_enabled: boolean
    credit_terms_enabled: boolean
    created_at: string
    updated_at: string
}

export interface UpdatePaymentSettingsData {
    razorpay_enabled?: boolean
    bank_transfer_enabled?: boolean
    credit_terms_enabled?: boolean
}

// =====================================================
// TAX SETTINGS
// =====================================================

export interface TaxSettings {
    id: string
    gst_enabled: boolean
    default_gst_percentage: number
    prices_include_tax: boolean
    use_cgst_sgst_igst: boolean
    store_state: string | null
    store_gstin: string | null
    created_at: string
    updated_at: string
}

export interface UpdateTaxSettingsData {
    gst_enabled?: boolean
    default_gst_percentage?: number
    prices_include_tax?: boolean
    use_cgst_sgst_igst?: boolean
    store_state?: string
    store_gstin?: string
}

// =====================================================
// SHIPPING SETTINGS
// =====================================================

export interface ShippingZone {
    zone: string
    condition: string
    rate: number
    enabled: boolean
}

export interface ShippingSettings {
    id: string
    free_shipping_enabled: boolean
    free_shipping_threshold: number
    flat_rate_enabled: boolean
    delivery_sla_text: string | null  // e.g., "7-10 business days"
    shipping_zones: ShippingZone[]
    created_at: string
    updated_at: string
}

export interface UpdateShippingSettingsData {
    free_shipping_enabled?: boolean
    free_shipping_threshold?: number
    flat_rate_enabled?: boolean
    delivery_sla_text?: string
    shipping_zones?: ShippingZone[]
}

// =====================================================
// SYSTEM SETTINGS
// =====================================================

export interface SystemSettings {
    id: string
    bulk_operations_enabled: boolean
    advanced_analytics_enabled: boolean
    experimental_features_enabled: boolean
    maintenance_mode_enabled: boolean
    maintenance_message: string
    debug_logging_enabled: boolean
    show_detailed_errors: boolean
    created_at: string
    updated_at: string
}

export interface UpdateSystemSettingsData {
    bulk_operations_enabled?: boolean
    advanced_analytics_enabled?: boolean
    experimental_features_enabled?: boolean
    maintenance_mode_enabled?: boolean
    maintenance_message?: string
    debug_logging_enabled?: boolean
    show_detailed_errors?: boolean
}

