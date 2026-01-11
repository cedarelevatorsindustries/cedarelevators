/**
 * Customer Hooks
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { CustomerWithStats, CustomerFilters } from '@/lib/types/customers'
import { getCustomers, getCustomerStats } from '@/lib/actions/customers/queries'


export const useCustomers = (filters: CustomerFilters, page: number, limit: number) => {
    return useQuery({
        queryKey: ['customers', filters, page, limit],
        queryFn: async () => {
            const result = await getCustomers(filters, page, limit)
            if (!result.success) {
                throw new Error(result.error)
            }
            return { customers: result.customers, total: result.total }
        },
        staleTime: 30000, // 30 seconds
    })
}

export const useCustomerStats = () => {
    return useQuery({
        queryKey: ['customer-stats'],
        queryFn: async () => {
            const result = await getCustomerStats()
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.stats
        },
        staleTime: 30000, // 30 seconds
    })
}

/**
 * Hook for fetching a single customer by ID
 */
export const useCustomer = (customerId: string) => {
    return useQuery({
        queryKey: ['customer', customerId],
        queryFn: async () => {
            const { getCustomerById } = await import('@/lib/actions/customers/queries')
            const result = await getCustomerById(customerId)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.customer
        },
        staleTime: 30000, // 30 seconds
        enabled: !!customerId, // Only run if customerId is provided
    })
}

