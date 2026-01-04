export interface InventoryItem {
    id: string
    variant_id: string
    product_name: string
    variant_name: string | null
    sku: string | null
    quantity: number
    low_stock_threshold: number
    track_quantity: boolean
    allow_backorders: boolean
    available_quantity: number
    reserved_quantity: number
    created_at: string
    updated_at: string
}

export interface InventoryAdjustment {
    variant_id: string
    quantity: number
    reason: string
    adjust_type: 'add' | 'subtract' | 'set'
}

export interface InventoryFilters {
    status?: 'all' | 'low_stock' | 'out_of_stock' | 'in_stock'
    stockStatus?: 'all' | 'low_stock' | 'out_of_stock' | 'in_stock'
    search?: string
}

