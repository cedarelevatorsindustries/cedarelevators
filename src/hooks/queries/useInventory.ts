/**
 * Inventory Hooks
 */

import { InventoryItem } from '@/lib/types/inventory'

export const useInventory = (filters: any) => {
    return {
        data: [] as InventoryItem[],
        isLoading: false,
        error: null,
        refetch: async () => { },
    }
}
