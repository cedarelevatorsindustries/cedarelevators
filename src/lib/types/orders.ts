/**
 * Order Types
 * Type definitions for order-related data structures
 */

export interface OrderWithDetails {
    id: string
    user_id: string | null
    guest_email: string | null
    guest_name: string | null
    guest_phone: string | null
    order_status: string
    payment_status: string
    payment_method: string | null
    subtotal_amount: number
    tax_amount: number
    shipping_amount: number
    discount_amount: number
    total_amount: number
    shipping_address: ShippingAddress | null
    billing_address: BillingAddress | null
    tracking_number: string | null
    tracking_carrier: string | null
    tracking_url: string | null
    shipping_tracking_number: string | null
    shipping_provider: string | null
    notes: string | null
    cancellation_reason: string | null
    created_at: string
    updated_at: string
    order_items?: OrderItem[]
    customer?: Customer | null
}

export interface ShippingAddress {
    name: string
    phone: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    pincode: string
    country: string
}

export interface BillingAddress {
    name: string
    phone: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    pincode: string
    country: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    variant_id: string
    quantity: number
    unit_price: number
    total_price: number
    price: number
    product_name: string
    variant_name?: string
    variant_sku?: string
    created_at: string
}

export interface Customer {
    id: string
    email: string
    full_name?: string
    phone?: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
