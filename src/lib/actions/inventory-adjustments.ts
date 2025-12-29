'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  InventoryAdjustment,
  InventoryAdjustmentFormData,
  AdjustmentType,
} from '@/lib/types/inventory-adjustments'
import { getCurrentAdminUser } from '@/lib/auth/admin-roles'

// =====================================================
// GET INVENTORY ADJUSTMENTS LOG
// =====================================================

export async function getInventoryAdjustments(
  productId?: string,
  limit: number = 50
): Promise<
  | { success: true; adjustments: InventoryAdjustment[] }
  | { success: false; error: string }
> {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    let query = supabase
      .from('inventory_adjustments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching inventory adjustments:', error)
      return { success: false, error: error.message }
    }

    return { success: true, adjustments: data as InventoryAdjustment[] }
  } catch (error: any) {
    console.error('Error in getInventoryAdjustments:', error)
    return { success: false, error: error.message || 'Failed to fetch adjustments' }
  }
}

// =====================================================
// ADJUST STOCK (MANUAL)
// =====================================================

export async function adjustStock(
  adjustmentData: InventoryAdjustmentFormData
): Promise<{ success: boolean; error?: string; newQuantity?: number }> {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    const adminUser = await getCurrentAdminUser()
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get current product stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('id', adjustmentData.product_id)
      .single()

    if (productError || !product) {
      return { success: false, error: 'Product not found' }
    }

    const quantityBefore = product.stock_quantity
    let quantityAfter: number

    // Calculate new quantity based on adjustment type
    switch (adjustmentData.adjustment_type) {
      case 'set':
        quantityAfter = adjustmentData.quantity
        break
      case 'add':
        quantityAfter = quantityBefore + adjustmentData.quantity
        break
      case 'reduce':
        quantityAfter = quantityBefore - adjustmentData.quantity
        break
      case 'recount':
        quantityAfter = adjustmentData.quantity // Physical recount sets to actual count
        break
      default:
        return { success: false, error: 'Invalid adjustment type' }
    }

    // Ensure quantity doesn't go negative
    if (quantityAfter < 0) {
      return { success: false, error: 'Stock quantity cannot be negative' }
    }

    const quantityChanged = quantityAfter - quantityBefore

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock_quantity: quantityAfter,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adjustmentData.product_id)

    if (updateError) {
      console.error('Error updating product stock:', updateError)
      return { success: false, error: 'Failed to update stock' }
    }

    // Log the adjustment
    const { error: logError } = await supabase
      .from('inventory_adjustments')
      .insert({
        product_id: adjustmentData.product_id,
        adjustment_type: adjustmentData.adjustment_type,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        quantity_changed: quantityChanged,
        reason: adjustmentData.reason,
        notes: adjustmentData.notes,
        adjusted_by: adminUser.clerk_user_id,
        adjusted_by_name: adminUser.full_name,
      })

    if (logError) {
      console.error('Error logging adjustment:', logError)
      // Don't fail the operation if logging fails
    }

    revalidatePath('/admin/inventory')
    revalidatePath(`/admin/products/${adjustmentData.product_id}`)

    return { success: true, newQuantity: quantityAfter }
  } catch (error: any) {
    console.error('Error in adjustStock:', error)
    return { success: false, error: error.message || 'Failed to adjust stock' }
  }
}

// =====================================================
// GET LOW STOCK ITEMS
// =====================================================

export async function getLowStockItems(
  threshold: number = 10
): Promise<
  | { success: true; items: any[] }
  | { success: false; error: string }
> {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, price, low_stock_threshold')
      .gt('stock_quantity', 0)
      .lte('stock_quantity', threshold)
      .eq('status', 'active')
      .order('stock_quantity', { ascending: true })

    if (error) {
      console.error('Error fetching low stock items:', error)
      return { success: false, error: error.message }
    }

    return { success: true, items: data || [] }
  } catch (error: any) {
    console.error('Error in getLowStockItems:', error)
    return { success: false, error: error.message || 'Failed to fetch low stock items' }
  }
}

// =====================================================
// UPDATE LOW STOCK THRESHOLD
// =====================================================

export async function updateLowStockThreshold(
  productId: string,
  threshold: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    if (threshold < 0) {
      return { success: false, error: 'Threshold cannot be negative' }
    }

    const { error } = await supabase
      .from('products')
      .update({
        low_stock_threshold: threshold,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (error) {
      console.error('Error updating low stock threshold:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/inventory')
    revalidatePath(`/admin/products/${productId}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateLowStockThreshold:', error)
    return { success: false, error: error.message || 'Failed to update threshold' }
  }
}
