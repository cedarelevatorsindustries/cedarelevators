/**
 * Customer Hooks
 */

import { CustomerWithStats } from '@/lib/types/customers'

export const useCustomers = (filters: any, page: number, limit: number) => {
    return {
        data: [] as CustomerWithStats[],
        isLoading: false,
        error: null,
        refetch: async () => { },
    }
}

export const useCustomerStats = () => {
    return {
        data: null,
        isLoading: false,
        error: null,
        refetch: async () => { },
    }
}

/**
 * Hook for fetching a single customer by ID
 */
export const useCustomer = (customerId: string) => {
    return {
        data: null as CustomerWithStats | null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: async () => { },
    }
}


