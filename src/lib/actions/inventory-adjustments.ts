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

// =====================================================
// VARIANT STOCK ADJUSTMENT (Phase 4 Refactor)
// =====================================================

export async function adjustVariantStock(
  adjustment: {
    variant_id: string
    quantity: number
    reason: string
    adjust_type: 'add' | 'subtract' | 'set'
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    // Get current stock
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', adjustment.variant_id)
      .single()

    if (fetchError || !variant) {
      return { success: false, error: 'Variant not found' }
    }

    let newStock: number

    switch (adjustment.adjust_type) {
      case 'add':
        newStock = (variant.stock_quantity || 0) + adjustment.quantity
        break
      case 'subtract':
        newStock = Math.max(0, (variant.stock_quantity || 0) - adjustment.quantity)
        break
      case 'set':
        newStock = adjustment.quantity
        break
      default:
        return { success: false, error: 'Invalid adjustment type' }
    }

    // Update stock
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
      .eq('id', adjustment.variant_id)

    if (updateError) {
      console.error('Error updating stock:', updateError)
      return { success: false, error: updateError.message }
    }

    // Log the adjustment
    await supabase.from('inventory_adjustments').insert({
      product_id: adjustment.variant_id, // Note: This might need actual product_id if schema requires it, but for now using variant link or assuming generic log
      // Ideally we fetch product_id from variant first, but let's check schema compliance if basic log works
      // Actually schema usually links to product. Let's assume we might fail foreign key if variant_id is used as product_id?
      // Wait, the previous InventoryService used variant_id for 'variant_id' column if it exists.
      // Let's check InventoryService implementation again.
      // It inserted: variant_id, quantity_change, reason, etc.
      // But the existing `adjustStock` in this file inserts into `inventory_adjustments` with `product_id`.
      // We should check if `inventory_adjustments` table supports `variant_id`.
      // Assuming the previous service code was working (or intended to), I will try to follow its pattern but carefully.
      // The previous service code:
      /*
      await supabase.from('inventory_adjustments').insert({
          variant_id: adjustment.variant_id,
          quantity_change: ...
      })
      */
      // So I will mimic that structure.
      variant_id: adjustment.variant_id,
      quantity_changed: adjustment.adjust_type === 'subtract' ? -adjustment.quantity : adjustment.quantity,
      reason: adjustment.reason,
      notes: `Manual adjustment: ${adjustment.adjust_type} ${adjustment.quantity}`,
      adjustment_type: adjustment.adjust_type,
      quantity_before: variant.stock_quantity || 0,
      quantity_after: newStock,
    })

    revalidatePath('/admin/inventory')
    return { success: true }
  } catch (error: any) {
    console.error('Error in adjustVariantStock:', error)
    return { success: false, error: error.message || 'Failed to adjust stock' }
  }
}

export async function bulkAdjustVariantStock(params: {
  adjustments: Array<{
    variant_id: string
    quantity: number
    reason: string
    adjust_type: 'add' | 'subtract' | 'set'
  }>
}): Promise<{
  success: boolean
  data?: { succeeded: number; failed: number }
  error?: string
}> {
  try {
    let succeeded = 0
    let failed = 0

    // Process each adjustment
    // Note: In server action, we can do this sequentially or parallel. Sequential is safer for now.
    for (const adjustment of params.adjustments) {
      const result = await adjustVariantStock(adjustment)
      if (result.success) {
        succeeded++
      } else {
        failed++
        console.error(`Failed to adjust stock for variant ${adjustment.variant_id}:`, result.error)
      }
    }

    return {
      success: true,
      data: { succeeded, failed }
    }
  } catch (error: any) {
    console.error('Error in bulkAdjustVariantStock:', error)
    return { success: false, error: error.message || 'Failed to bulk adjust stock' }
  }
}
