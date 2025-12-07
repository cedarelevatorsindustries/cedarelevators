import { HttpTypes } from "@medusajs/types"

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export function getOrderStatus(order: HttpTypes.StoreOrder): OrderStatus {
  return (order.status as OrderStatus) || 'pending'
}

export function getPaymentStatus(order: HttpTypes.StoreOrder): string {
  return order.payment_status || 'pending'
}

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

export function calculateOrderSummary(orders: HttpTypes.StoreOrder[]) {
  return {
    total: orders.length,
    totalValue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
  }
}

export function filterOrdersByStatus(orders: HttpTypes.StoreOrder[], status: string) {
  if (status === 'all') return orders
  return orders.filter(order => order.status === status)
}

export function filterOrdersByDateRange(orders: HttpTypes.StoreOrder[], range: string) {
  const now = new Date()
  const filtered = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    switch (range) {
      case 'last_7_days':
        return (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
      case 'last_30_days':
        return (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 30
      case 'last_90_days':
        return (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 90
      default:
        return true
    }
  })
  return filtered
}

export function searchOrders(orders: HttpTypes.StoreOrder[], query: string) {
  const lowerQuery = query.toLowerCase()
  return orders.filter(order => 
    order.display_id?.toString().includes(lowerQuery) ||
    order.email?.toLowerCase().includes(lowerQuery)
  )
}

export function getOrderItemCount(order: HttpTypes.StoreOrder): number {
  return order.items?.length || 0
}

export function canCancelOrder(order: HttpTypes.StoreOrder): boolean {
  return order.status === 'pending' || order.status === 'processing'
}

export function canReorderOrder(order: HttpTypes.StoreOrder): boolean {
  return order.status === 'delivered' || order.status === 'cancelled'
}

export function canTrackOrder(order: HttpTypes.StoreOrder): boolean {
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
