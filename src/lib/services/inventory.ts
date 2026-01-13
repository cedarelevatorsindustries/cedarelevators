"use server"

import { createServerSupabase } from "@/lib/supabase/server"
import { logger } from "@/lib/services/logger"

/**
 * Inventory Service
 * Handles inventory-related operations and queries
 */

export interface InventoryItem {
    id: string
    variant_id: string
    warehouse_id?: string
    quantity: number
    reserved: number
    available_quantity: number
    low_stock_threshold: number
    last_restock_at?: string
    created_at: string
    updated_at: string
}

/**
 * Get inventory for a specific variant
 */
export async function getVariantInventory(variantId: string): Promise<InventoryItem | null> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('variant_id', variantId)
        .single()

    if (error) {
        logger.error('Error fetching variant inventory', error)
        return null
    }

    return data as InventoryItem
}

/**
 * Get all inventory items for a product (across all variants)
 */
export async function getProductInventory(productId: string): Promise<InventoryItem[]> {
    const supabase = await createServerSupabase()

    // First get all variants for the product
    const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId)

    if (variantsError || !variants || variants.length === 0) {
        return []
    }

    const variantIds = variants.map(v => v.id)

    // Get inventory for all variants
    const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .in('variant_id', variantIds)

    if (inventoryError) {
        logger.error('Error fetching product inventory', inventoryError)
        return []
    }

    return (inventory || []) as InventoryItem[]
}

/**
 * Check if inventory exists for a variant
 */
export async function verifyVariantInventoryExists(variantId: string): Promise<boolean> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('variant_id', variantId)
        .single()

    return !error && !!data
}

/**
 * Get total available inventory for a product (sum across all variants)
 */
export async function getProductAvailableQuantity(productId: string): Promise<number> {
    const inventory = await getProductInventory(productId)
    return inventory.reduce((total, item) => total + (item.available_quantity || 0), 0)
}

/**
 * Check if a variant has sufficient stock
 */
export async function checkStockAvailability(variantId: string, requestedQuantity: number): Promise<{
    available: boolean
    availableQuantity: number
    message?: string
}> {
    const inventory = await getVariantInventory(variantId)

    if (!inventory) {
        return {
            available: false,
            availableQuantity: 0,
            message: 'Inventory record not found'
        }
    }

    const availableQty = inventory.available_quantity || 0

    return {
        available: availableQty >= requestedQuantity,
        availableQuantity: availableQty,
        message: availableQty >= requestedQuantity
            ? undefined
            : `Only ${availableQty} units available`
    }
}

/**
 * Reserve inventory for an order (to be called when order is created)
 * This prevents overselling
 */
export async function reserveInventory(variantId: string, quantity: number): Promise<{
    success: boolean
    error?: string
}> {
    const supabase = await createServerSupabase()

    // Check availability first
    const stockCheck = await checkStockAvailability(variantId, quantity)

    if (!stockCheck.available) {
        return {
            success: false,
            error: stockCheck.message || 'Insufficient stock'
        }
    }

    // Increment reserved quantity using atomic RPC
    const { error } = await supabase.rpc('inventory_adjust', {
        p_variant_id: variantId,
        p_quantity_delta: 0,
        p_reserved_delta: quantity
    })

    if (error) {
        logger.error('Error reserving inventory', error)
        return {
            success: false,
            error: 'Failed to reserve inventory'
        }
    }

    return { success: true }
}

/**
 * Release reserved inventory (when order is cancelled)
 */
export async function releaseInventory(variantId: string, quantity: number): Promise<{
    success: boolean
    error?: string
}> {
    const supabase = await createServerSupabase()

    const { error } = await supabase.rpc('inventory_adjust', {
        p_variant_id: variantId,
        p_quantity_delta: 0,
        p_reserved_delta: -quantity
    })

    if (error) {
        logger.error('Error releasing inventory', error)
        return {
            success: false,
            error: 'Failed to release inventory'
        }
    }

    return { success: true }
}

/**
 * Fulfill order - deduct from both quantity and reserved
 */
export async function fulfillInventory(variantId: string, quantity: number): Promise<{
    success: boolean
    error?: string
}> {
    const supabase = await createServerSupabase()

    const { error } = await supabase.rpc('inventory_adjust', {
        p_variant_id: variantId,
        p_quantity_delta: -quantity,
        p_reserved_delta: -quantity
    })

    if (error) {
        logger.error('Error fulfilling inventory', error)
        return {
            success: false,
            error: 'Failed to fulfill inventory'
        }
    }

    return { success: true }
}

// ==========================================
// Admin Inventory Server Actions
// ==========================================

export interface AdminInventoryItem {
    id: string
    variant_id: string
    quantity: number
    reserved: number
    available_quantity: number
    low_stock_threshold: number
    last_restock_at?: string
    created_at: string
    updated_at: string
    product_name: string
    variant_name: string | null
    sku: string | null
    price: number | null
    thumbnail: string | null
    product_id: string
}

export interface InventoryStats {
    totalItems: number
    inStock: number
    lowStock: number
    outOfStock: number
    totalValue: number
}

export interface LowStockItem {
    id: string
    variant_id: string
    product_name: string
    name: string  // Alias for product_name
    variant_name: string | null
    sku: string | null
    current_stock: number
    currentStock: number  // Alias for current_stock
    threshold: number
    thumbnail: string | null
}

/**
 * Get admin inventory list with filtering and pagination
 */
export async function getAdminInventoryList(
    filters: { stockStatus?: string; search?: string },
    page: number = 1,
    limit: number = 50
): Promise<AdminInventoryItem[]> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
        .from('inventory_items')
        .select(`
            id,
            variant_id,
            quantity,
            reserved,
            available_quantity,
            low_stock_threshold,
            last_restock_at,
            created_at,
            updated_at,
            product_variants!inner (
                id,
                name,
                sku,
                price,
                image_url,
                products!inner (
                    id,
                    name,
                    thumbnail_url
                )
            )
        `)
        .range((page - 1) * limit, page * limit - 1)

    if (error) {
        logger.error('Error fetching admin inventory', error)
        return []
    }

    // Transform to flat structure
    let inventory = (data || []).map((item: any) => {
        const variant = item.product_variants
        const product = variant?.products
        return {
            id: item.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            reserved: item.reserved || 0,
            available_quantity: item.available_quantity ?? (item.quantity - (item.reserved || 0)),
            low_stock_threshold: item.low_stock_threshold || 10,
            last_restock_at: item.last_restock_at,
            created_at: item.created_at,
            updated_at: item.updated_at,
            product_name: product?.name || 'Unknown Product',
            variant_name: variant?.name,
            sku: variant?.sku,
            price: variant?.price,
            thumbnail: variant?.image_url || product?.thumbnail_url,
            product_id: product?.id
        }
    })

    // Apply stock status filter
    if (filters.stockStatus && filters.stockStatus !== 'all') {
        inventory = inventory.filter((item: AdminInventoryItem) => {
            if (filters.stockStatus === 'in_stock') return item.quantity > item.low_stock_threshold
            if (filters.stockStatus === 'low_stock') return item.quantity > 0 && item.quantity <= item.low_stock_threshold
            if (filters.stockStatus === 'out_of_stock') return item.quantity <= 0
            return true
        })
    }

    // Apply search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        inventory = inventory.filter((item: AdminInventoryItem) =>
            item.product_name.toLowerCase().includes(searchLower) ||
            item.variant_name?.toLowerCase().includes(searchLower) ||
            item.sku?.toLowerCase().includes(searchLower)
        )
    }

    return inventory
}

/**
 * Get inventory statistics for admin dashboard
 */
export async function getInventoryStats(): Promise<InventoryStats> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
        .from('inventory_items')
        .select(`
            quantity,
            low_stock_threshold,
            product_variants!inner (
                price
            )
        `)

    if (error) {
        logger.error('Error fetching inventory stats', error)
        return { totalItems: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 }
    }

    const items = data || []
    let inStock = 0, lowStock = 0, outOfStock = 0, totalValue = 0

    for (const item of items) {
        const threshold = item.low_stock_threshold || 10
        const price = (item.product_variants as any)?.price || 0

        if (item.quantity <= 0) {
            outOfStock++
        } else if (item.quantity <= threshold) {
            lowStock++
        } else {
            inStock++
        }
        totalValue += item.quantity * price
    }

    return {
        totalItems: items.length,
        inStock,
        lowStock,
        outOfStock,
        totalValue
    }
}

/**
 * Get low stock alerts for admin dashboard
 */
export async function getLowStockAlerts(): Promise<LowStockItem[]> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
        .from('inventory_items')
        .select(`
            id,
            variant_id,
            quantity,
            low_stock_threshold,
            product_variants!inner (
                name,
                sku,
                image_url,
                products!inner (
                    name,
                    thumbnail_url
                )
            )
        `)
        .lte('quantity', 10) // Low stock threshold
        .limit(20)

    if (error) {
        logger.error('Error fetching low stock alerts', error)
        return []
    }

    // Filter items where quantity <= low_stock_threshold
    return (data || [])
        .filter((item: any) => item.quantity <= (item.low_stock_threshold || 10))
        .map((item: any) => {
            const variant = item.product_variants
            const product = variant?.products
            return {
                id: item.id,
                variant_id: item.variant_id,
                product_name: product?.name || 'Unknown Product',
                name: product?.name || 'Unknown Product',  // Alias for product_name
                variant_name: variant?.name,
                sku: variant?.sku,
                current_stock: item.quantity,
                currentStock: item.quantity,  // Alias for current_stock
                threshold: item.low_stock_threshold || 10,
                thumbnail: variant?.image_url || product?.thumbnail_url
            }
        })
}
