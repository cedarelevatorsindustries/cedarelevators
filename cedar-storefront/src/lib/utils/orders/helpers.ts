import { Order } from "@/lib/types/domain"

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export function getOrderStatus(order: Order): OrderStatus {
  return (order.status as OrderStatus) || 'pending'
}

export function getPaymentStatus(order: Order): string {
  return (order as any).payment_status || 'pending' // Order type might not have payment_status yet in domain
}

// ... skipping unrelated lines is hard with replace_file_content if I want to do all in one.
// I'll do chunk based replacement for the function signatures.

export function getStatusBadgeColor(status: string): string {
  return getOrderStatusColor(status)
}

export function getPaymentBadgeColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'green'
    case 'pending':
      return 'yellow'
    case 'failed':
      return 'red'
    default:
      return 'gray'
  }
}

export function formatStatusLabel(status: string): string {
  return getOrderStatusLabel(status)
}

export function formatPaymentLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

export function calculateOrderSummary(orders: Order[]) {
  const delivered = orders.filter(o => o.status === 'delivered').length
  const inTransit = orders.filter(o => o.status === 'shipped' || o.status === 'processing').length
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)

  return {
    total: orders.length,
    totalOrders: orders.length,
    totalValue: totalSpent,
    totalSpent,
    delivered,
    inTransit,
  }
}

export function filterOrdersByStatus(orders: Order[], status: string) {
  if (status === 'all') return orders
  return orders.filter(order => order.status === status)
}

export function filterOrdersByDateRange(orders: Order[], range: string | number) {
  const now = new Date()
  const rangeStr = typeof range === 'number' ? range.toString() : range
  const filtered = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    switch (rangeStr) {
      case 'last_7_days':
      case '7':
        return (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
      case 'last_30_days':
      case '30':
        return (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 30
      case 'last_90_days':
      case '90':
        return (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 90
      default:
        return true
    }
  })
  return filtered
}

export function searchOrders(orders: Order[], query: string) {
  const lowerQuery = query.toLowerCase()
  return orders.filter(order =>
    order.display_id?.toString().includes(lowerQuery) ||
    order.email?.toLowerCase().includes(lowerQuery)
  )
}

export function getOrderItemCount(order: Order): number {
  return order.items?.length || 0
}

export function canCancelOrder(order: Order): boolean {
  return order.status === 'pending' || order.status === 'processing'
}

export function canReorderOrder(order: Order): boolean {
  return order.status === 'delivered' || order.status === 'cancelled'
}

export function canTrackOrder(order: Order): boolean {
  return order.status === 'shipped' || order.status === 'processing'
}

export function getOrderStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'yellow'
    case 'processing':
      return 'blue'
    case 'shipped':
      return 'purple'
    case 'delivered':
      return 'green'
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

export function getOrderStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

export function formatOrderDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
