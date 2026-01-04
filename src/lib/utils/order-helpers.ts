/**
 * Order Helper Utilities
 */

import { ShippingAddress, BillingAddress } from '@/lib/types/orders'

export function getProductTitle(productName?: string): string {
    return productName || 'Unknown Product'
}

export function getVariantName(variantName?: string | null): string {
    return variantName || 'Default'
}

export function getCustomerName(guestName?: string | null, email?: string | null): string {
    return guestName || email || 'Guest Customer'
}

export function getOrderNumber(orderId: string): string {
    if (typeof orderId !== 'string') return '#UNKNOWN'
    return `#${orderId.slice(0, 8).toUpperCase()}`
}

export function formatAddress(address: ShippingAddress | BillingAddress | null): string {
    if (!address) return 'No address provided'

    const parts = [
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.pincode,
        address.country
    ].filter(Boolean)

    return parts.join(', ')
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getItemsCount(order: { order_items?: any[] }): number {
    return order.order_items?.length || 0
}

