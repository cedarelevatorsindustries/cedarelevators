/**
 * Inventory Hooks - React Query implementations for inventory management
 * Uses server actions instead of API routes to avoid auth issues with client fetch
 */

import { useQuery } from '@tanstack/react-query'
import {
    getAdminInventoryList,
    getInventoryStats,
    getLowStockAlerts,
    AdminInventoryItem,
    InventoryStats,
    LowStockItem
} from '@/lib/services/inventory'
import { InventoryFilters } from '@/lib/types/inventory'

/**
 * Hook to fetch inventory items with filtering and pagination
 * Uses server action which runs on server with proper auth context
 */
export const useInventory = (filters: InventoryFilters, page = 1, limit = 50) => {
    return useQuery<AdminInventoryItem[]>({
        queryKey: ['inventory', filters, page, limit],
        queryFn: async () => {
            console.log('[useInventory] Calling server action with:', { filters, page, limit })
            const result = await getAdminInventoryList(
                { stockStatus: filters.stockStatus || filters.status, search: filters.search },
                page,
                limit
            )
            console.log('[useInventory] Server action returned:', { count: result.length })
            return result
        },
        staleTime: 30000 // 30 seconds
    })
}

/**
 * Hook to fetch inventory statistics
 * Uses server action which runs on server with proper auth context
 */
export const useInventoryStats = () => {
    return useQuery<InventoryStats>({
        queryKey: ['inventory-stats'],
        queryFn: async () => {
            console.log('[useInventoryStats] Calling server action...')
            const result = await getInventoryStats()
            console.log('[useInventoryStats] Server action returned:', result)
            return result
        },
        staleTime: 60000 // 1 minute
    })
}

/**
 * Hook to fetch low stock alerts
 * Uses server action which runs on server with proper auth context
 */
export const useLowStockAlerts = () => {
    return useQuery<LowStockItem[]>({
        queryKey: ['low-stock-alerts'],
        queryFn: async () => {
            console.log('[useLowStockAlerts] Calling server action...')
            const result = await getLowStockAlerts()
            console.log('[useLowStockAlerts] Server action returned:', { count: result.length })
            return result
        },
        staleTime: 60000 // 1 minute
    })
}
