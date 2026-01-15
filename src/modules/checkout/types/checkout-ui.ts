// Checkout UI Types - Updated for individual checkout, shipping options, COD only

export type CheckoutSource = 'cart' | 'quote'

export type CheckoutPermission =
    | 'full_checkout'           // Verified business
    | 'individual_checkout'     // Individual user (with limits)
    | 'blocked_verify'          // Unverified business
    | 'blocked_signin'          // Guest

export type ShippingMethod = 'doorstep' | 'pickup'

export interface IndividualLimits {
    maxOrderValue: number
    maxQuantityPerItem: number
    maxAddresses: number
    allowedPaymentMethods: ['cod']
    allowedShippingMethods: ('doorstep' | 'pickup')[]
}

export const INDIVIDUAL_LIMITS: IndividualLimits = {
    maxOrderValue: 50000,
    maxQuantityPerItem: 10,
    maxAddresses: 2,
    allowedPaymentMethods: ['cod'],
    allowedShippingMethods: ['doorstep', 'pickup']
}

export interface PickupLocation {
    id: string
    name: string
    address: string
    city: string
    state?: string
    phone?: string
    hours?: string
    is_active: boolean
}

export interface CheckoutAddress {
    id?: string
    name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
    email?: string
}

export interface ShippingOption {
    method: ShippingMethod
    pickupLocationId?: string
    address?: CheckoutAddress
}

export interface CheckoutContext {
    source: CheckoutSource
    sourceId: string
    permission: CheckoutPermission
    userType: 'guest' | 'individual' | 'business_unverified' | 'business_verified'
    isVerified: boolean
    limits?: IndividualLimits
}

export interface CheckoutItem {
    id: string
    title: string
    thumbnail: string | null
    quantity: number
    unit_price?: number
    subtotal?: number
}

export interface CheckoutSummary {
    subtotal: number
    tax: number
    shipping: number
    discount: number
    total: number
}

export interface BusinessInfo {
    company_name: string
    gst_number: string
    is_verified: boolean
}

export interface CheckoutData {
    items: CheckoutItem[]
    summary: CheckoutSummary
    businessInfo?: BusinessInfo
    canCheckout: boolean
    blockReason?: string
    quoteNumber?: string
}

export interface OrderPlacementInput {
    source: CheckoutSource
    sourceId: string
    shippingOption: ShippingOption
    paymentMethod: 'cod'
    notes?: string
}
