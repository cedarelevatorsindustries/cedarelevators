import { OrderWithDetails } from '@/lib/types/orders'

/**
 * Get customer name from order
 */
export function getCustomerName(order: OrderWithDetails): string {
    return order.guest_name || order.customer?.full_name || 'Guest Customer'
}

/**
 * Generate order number from ID
 */
export function getOrderNumber(order: OrderWithDetails): string {
    // Generate a formatted order number like #ORD-12345
    const shortId = order.id.slice(0, 8).toUpperCase()
    return `#ORD-${shortId}`
}

/**
 * Get total items count in order
 */
export function getItemsCount(order: OrderWithDetails): number {
    if (!order.order_items || order.order_items.length === 0) {
        return 0
    }
    return order.order_items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Format shipping address for display
 */
export function formatAddress(address: any): string {
    if (!address) return 'No address provided'

    const parts = [
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.pincode
    ].filter(Boolean)

    return parts.join(', ')
}

/**
 * Get status badge color classes
 */
export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        processing: 'bg-blue-100 text-blue-800 border-blue-200',
        shipped: 'bg-purple-100 text-purple-800 border-purple-200',
        delivered: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200'
    }

    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Get payment status badge color classes
 */
export function getPaymentStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        paid: 'bg-green-100 text-green-800 border-green-200',
        failed: 'bg-red-100 text-red-800 border-red-200',
        refunded: 'bg-orange-100 text-orange-800 border-orange-200'
    }

    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
    const symbols: Record<string, string> = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£'
    }

    const symbol = symbols[currency] || currency
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Calculate order summary
 */
export function calculateOrderSummary(order: OrderWithDetails) {
    return {
        subtotal: order.subtotal_amount || 0,
        tax: order.tax_amount || 0,
        shipping: order.shipping_amount || 0,
        discount: order.discount_amount || 0,
        total: order.total_amount || 0
    }
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: OrderWithDetails): boolean {
    const cancellableStatuses = ['pending', 'processing']
    return cancellableStatuses.includes(order.order_status)
}

/**
 * Check if order can be shipped
 */
export function canShipOrder(order: OrderWithDetails): boolean {
    const shippableStatuses = ['pending', 'processing']
    return shippableStatuses.includes(order.order_status)
}

/**
 * Check if order can be marked as delivered
 */
export function canMarkDelivered(order: OrderWithDetails): boolean {
    return order.order_status === 'shipped'
}
