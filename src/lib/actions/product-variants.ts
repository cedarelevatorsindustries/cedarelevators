'use server'

import { createServerSupabase, createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

/**
 * Create product variant
 */
export async function createProductVariant(data: {
  product_id: string
  name: string
  sku: string
  price: number
  compare_at_price?: number
  cost_per_item?: number
  inventory_quantity?: number
  status?: 'active' | 'inactive'
  barcode?: string
  weight?: number
  image_url?: string
  option1_name?: string
  option1_value?: string
  option2_name?: string
  option2_value?: string
  option3_name?: string
  option3_value?: string
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Validate required fields
    if (!data.product_id || !data.name || !data.sku || !data.price) {
      return { success: false, error: 'Product ID, name, SKU, and price are required' }
    }
    
    // Check if SKU already exists
    const { data: existing } = await supabase
      .from('product_variants')
      .select('id')
      .eq('sku', data.sku)
      .single()
    
    if (existing) {
      return { success: false, error: 'Variant with this SKU already exists' }
    }
    
    const { data: variant, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: data.product_id,
        name: data.name,
        sku: data.sku,
        price: data.price,
        compare_at_price: data.compare_at_price,
        cost_per_item: data.cost_per_item,
        inventory_quantity: data.inventory_quantity || 0,
        status: data.status || 'active',
        barcode: data.barcode,
        weight: data.weight,
        image_url: data.image_url,
        option1_name: data.option1_name,
        option1_value: data.option1_value,
        option2_name: data.option2_name,
        option2_value: data.option2_value,
        option3_name: data.option3_name,
        option3_value: data.option3_value,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating variant:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, variant }
  } catch (error: any) {
    console.error('Error in createProductVariant:', error)
    return { success: false, error: error.message || 'Failed to create variant' }
  }
}

/**
 * Update product variant
 */
export async function updateProductVariant(
  id: string,
  updates: Partial<{
    name: string
    sku: string
    price: number
    compare_at_price: number
    cost_per_item: number
    inventory_quantity: number
    status: 'active' | 'inactive'
    barcode: string
    weight: number
    image_url: string
    option1_name: string
    option1_value: string
    option2_name: string
    option2_value: string
    option3_name: string
    option3_value: string
  }>
) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // If SKU is being updated, check uniqueness
    if (updates.sku) {
      const { data: existing } = await supabase
        .from('product_variants')
        .select('id')
        .eq('sku', updates.sku)
        .neq('id', id)
        .single()
      
      if (existing) {
        return { success: false, error: 'Variant with this SKU already exists' }
      }
    }
    
    const { data: variant, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating variant:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, variant }
  } catch (error: any) {
    console.error('Error in updateProductVariant:', error)
    return { success: false, error: error.message || 'Failed to update variant' }
  }
}

/**
 * Delete product variant
 */
export async function deleteProductVariant(id: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting variant:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteProductVariant:', error)
    return { success: false, error: error.message || 'Failed to delete variant' }
  }
}

/**
 * Get variants for a product
 */
export async function getProductVariants(productId: string) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('created_at')
    
    if (error) {
      console.error('Error fetching variants:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, variants }
  } catch (error: any) {
    console.error('Error in getProductVariants:', error)
    return { success: false, error: error.message || 'Failed to fetch variants' }
  }
}

/**
 * Get single variant by ID
 */
export async function getVariantById(id: string) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        product:products(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching variant:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, variant }
  } catch (error: any) {
    console.error('Error in getVariantById:', error)
    return { success: false, error: error.message || 'Failed to fetch variant' }
  }
}

/**
 * Bulk create variants for a product
 */
export async function bulkCreateVariants(productId: string, variants: any[]) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    if (!variants || variants.length === 0) {
      return { success: false, error: 'No variants provided' }
    }
    
    // Validate each variant has required fields
    for (const variant of variants) {
      if (!variant.name || !variant.sku || !variant.price) {
        return { success: false, error: 'Each variant must have name, SKU, and price' }
      }
    }
    
    // Add product_id to each variant
    const variantsToInsert = variants.map(v => ({
      ...v,
      product_id: productId,
      status: v.status || 'active',
      inventory_quantity: v.inventory_quantity || 0,
    }))
    
    const { data: createdVariants, error } = await supabase
      .from('product_variants')
      .insert(variantsToInsert)
      .select()
    
    if (error) {
      console.error('Error bulk creating variants:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, variants: createdVariants }
  } catch (error: any) {
    console.error('Error in bulkCreateVariants:', error)
    return { success: false, error: error.message || 'Failed to bulk create variants' }
  }
}

/**
 * Update variant inventory
 */
export async function updateVariantInventory(id: string, quantity: number, operation: 'set' | 'increment' | 'decrement' = 'set') {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    if (operation === 'set') {
      const { data: variant, error } = await supabase
        .from('product_variants')
        .update({ inventory_quantity: quantity })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating inventory:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true, variant }
    } else {
      // For increment/decrement, we need to fetch current value first
      const { data: current } = await supabase
        .from('product_variants')
        .select('inventory_quantity')
        .eq('id', id)
        .single()
      
      if (!current) {
        return { success: false, error: 'Variant not found' }
      }
      
      const newQuantity = operation === 'increment'
        ? (current.inventory_quantity || 0) + quantity
        : Math.max(0, (current.inventory_quantity || 0) - quantity)
      
      const { data: variant, error } = await supabase
        .from('product_variants')
        .update({ inventory_quantity: newQuantity })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating inventory:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true, variant }
    }
  } catch (error: any) {
    console.error('Error in updateVariantInventory:', error)
    return { success: false, error: error.message || 'Failed to update inventory' }
  }
}

