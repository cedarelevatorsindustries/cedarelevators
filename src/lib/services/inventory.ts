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
