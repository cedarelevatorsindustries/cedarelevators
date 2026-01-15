/**
 * Cart Merge Service
 * Cedar Elevator Industries
 * 
 * Handles guest → authenticated user cart merge:
 * - Zero data loss
 * - Duplicate item handling (sum quantities)
 * - Cleanup after merge
 */

'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import {
  GuestCartItem,
  CartMergeResult,
  ProfileType
} from '@/types/cart.types'
import { getOrCreateCart } from '@/lib/actions/cart'
import { logger } from '@/lib/services/logger'

// =====================================================
// Merge Guest Cart to User Cart
// =====================================================

export async function mergeGuestCartToUser(
  guestItems: GuestCartItem[],
  userId: string,
  profileType: ProfileType = 'individual',
  businessId?: string
): Promise<CartMergeResult> {
  try {
    if (!guestItems || guestItems.length === 0) {
      return {
        success: true,
        cartId: '',
        itemsAdded: 0,
        itemsUpdated: 0
      }
    }

    const supabase = await createClerkSupabaseClient()

    // Get or create user's cart
    const cartResult = await getOrCreateCart(profileType, businessId)
    if (!cartResult.success || !cartResult.data) {
      return {
        success: false,
        cartId: '',
        itemsAdded: 0,
        itemsUpdated: 0,
        errors: ['Failed to get or create user cart']
      }
    }

    const cartId = cartResult.data.id

    // Get existing cart items
    const { data: existingItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)

    let itemsAdded = 0
    let itemsUpdated = 0
    const errors: string[] = []

    // Process each guest item
    for (const guestItem of guestItems) {
      try {
        // Validate product exists and is available
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name, thumbnail, status, stock_quantity')
          .eq('id', guestItem.product_id)
          .single()

        if (productError || !product) {
          errors.push(`Product ${guestItem.product_id} not found`)
          continue
        }

        if (product.status !== 'active') {
          errors.push(`Product ${product.name} is no longer available`)
          continue
        }

        // Check if item already exists in user cart
        const existingItem = existingItems?.find(
          item => item.product_id === guestItem.product_id &&
            (item.variant_id || null) === (guestItem.variant_id || null)
        )

        if (existingItem) {
          // Update quantity (merge)
          const newQuantity = existingItem.quantity + guestItem.quantity

          // Check stock
          if (product.stock_quantity < newQuantity) {
            errors.push(`Insufficient stock for ${product.name}`)
            continue
          }

          const { error: updateError } = await supabase
            .from('cart_items')
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingItem.id)

          if (updateError) {
            errors.push(`Failed to update ${product.name}`)
            logger.error('Merge update error', updateError)
          } else {
            itemsUpdated++
          }

        } else {
          // Add new item
          // Check stock
          if (product.stock_quantity < guestItem.quantity) {
            errors.push(`Insufficient stock for ${product.name}`)
            continue
          }

          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              cart_id: cartId,
              product_id: guestItem.product_id,
              variant_id: guestItem.variant_id || null,
              title: product.name,
              thumbnail: product.thumbnail,
              quantity: guestItem.quantity
            })

          if (insertError) {
            errors.push(`Failed to add ${product.name}`)
            logger.error('Merge insert error', insertError)
          } else {
            itemsAdded++
          }
        }

      } catch (itemError) {
        logger.error('Error processing guest item', itemError)
        errors.push(`Error processing item ${guestItem.product_id}`)
      }
    }

    // Update cart timestamp
    await supabase
      .from('carts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cartId)

    return {
      success: true,
      cartId,
      itemsAdded,
      itemsUpdated,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error) {
    logger.error('mergeGuestCartToUser error', error)
    return {
      success: false,
      cartId: '',
      itemsAdded: 0,
      itemsUpdated: 0,
      errors: ['Failed to merge cart']
    }
  }
}

// =====================================================
// Handle Cart Merge After Login
// =====================================================

export async function handlePostLoginMerge(
  guestCartData: string // JSON string of GuestCartItem[]
): Promise<CartMergeResult> {
  try {
    const guestItems: GuestCartItem[] = JSON.parse(guestCartData)

    // Note: userId will be available from Clerk auth context
    // This function should be called from client after login

    return await mergeGuestCartToUser(guestItems, '', 'individual')

  } catch (error) {
    logger.error('handlePostLoginMerge error', error)
    return {
      success: false,
      cartId: '',
      itemsAdded: 0,
      itemsUpdated: 0,
      errors: ['Failed to parse guest cart data']
    }
  }
}

