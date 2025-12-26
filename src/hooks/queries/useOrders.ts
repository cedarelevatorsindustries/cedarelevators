'use client'

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { OrderWithDetails } from '@/lib/types/orders'

/**
 * Order Statistics Interface
 */
export interface OrderStats {
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    totalRevenue: number
}

/**
 * Order Filters Interface  
 */
export interface OrderFilters {
    search?: string
    status?: string
    paymentStatus?: string
    dateFrom?: string
    dateTo?: string
    customer?: string
}

/**
 * Fetch orders from API
 */
async function fetchOrders(filters: OrderFilters = {}): Promise<OrderWithDetails[]> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.paymentStatus && filters.paymentStatus !== 'all') params.append('paymentStatus', filters.paymentStatus)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    if (filters.customer) params.append('customer', filters.customer)

    const queryString = params.toString()
    const url = queryString ? `/api/admin/orders?${queryString}` : '/api/admin/orders'

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch orders')
    }

    const data = await response.json()
    return data.orders || []
}

/**
 * Fetch order statistics from API
 */
async function fetchOrderStats(): Promise<OrderStats> {
    const response = await fetch('/api/admin/orders/stats')

    if (!response.ok) {
        throw new Error('Failed to fetch order stats')
    }

    const data = await response.json()
    return data.stats || {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0
    }
}

/**
 * Hook to fetch orders with filters
 */
export function useOrders(filters: OrderFilters = {}): UseQueryResult<OrderWithDetails[], Error> {
    return useQuery({
        queryKey: ['orders', filters],
        queryFn: () => fetchOrders(filters),
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
    })
}

/**
 * Hook to fetch order statistics
 */
export function useOrderStats(): UseQueryResult<OrderStats, Error> {
    return useQuery({
        queryKey: ['orderStats'],
        queryFn: fetchOrderStats,
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: false,
    })
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(orderId: string | null): UseQueryResult<OrderWithDetails, Error> {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            if (!orderId) throw new Error('Order ID is required')

            const response = await fetch(`/api/admin/orders/${orderId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch order')
            }

            const data = await response.json()
            return data.order
        },
        enabled: !!orderId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    })
}
