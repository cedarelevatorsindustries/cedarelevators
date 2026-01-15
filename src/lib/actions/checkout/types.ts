/**
 * Checkout Types & Interfaces
 * Cedar Elevator Industries
 */

export interface CheckoutEligibility {
    eligible: boolean
    reason?: string
    message?: string
}

export interface BusinessAddress {
    id?: string
    business_id: string
    address_type: 'shipping' | 'billing' | 'both'
    contact_name: string
    contact_phone: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country?: string
    is_default?: boolean
    gst_number?: string
}

export interface CheckoutSummary {
    subtotal: number
    tax: number
    gst_percentage: number
    shipping: number
    discount: number
    total: number
    currency: string
}

export interface ActionResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface CheckoutMetadata {
    sessionId?: string
    ipAddress?: string
    userAgent?: string
}
