/**
 * Cart Edge Case Handlers
 * Cedar Elevator Industries
 * 
 * Handles various edge cases in cart:
 * - Product availability changes
 * - Business verification status changes
 * - Price changes
 * - Stock updates
 */

'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { CartItem, DerivedCartItem } from '@/types/cart.types'
import { logger } from '@/lib/services/logger'

export interface CartIssue {
  type: 'product_deleted' | 'out_of_stock' | 'price_changed' | 'product_inactive'
  itemId: string
  productId: string
  productName: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

/**
 * Validate cart items and detect issues
 */
export async function validateCartItems(cartId: string): Promise<CartIssue[]> {
  try {
    const supabase = await createClerkSupabaseClient()
    const issues: CartIssue[] = []

    // Get cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)

    if (!cartItems || cartItems.length === 0) {
      return issues
    }

    // Check each item
    for (const item of cartItems) {
      // Check if product exists
      const { data: product } = await supabase
        .from('products')
        .select('id, name, status, price, stock_quantity')
        .eq('id', item.product_id)
        .single()

      if (!product) {
        issues.push({
          type: 'product_deleted',
          itemId: item.id,
          productId: item.product_id,
          productName: item.title,
          message: `${item.title} is no longer available`,
          severity: 'error'
        })
        continue
      }

      // Check if product is active
      if (product.status !== 'active') {
        issues.push({
          type: 'product_inactive',
          itemId: item.id,
          productId: item.product_id,
          productName: product.name,
          message: `${product.name} is currently unavailable`,
          severity: 'error'
        })
        continue
      }

      // Check stock
      if (product.stock_quantity < item.quantity) {
        issues.push({
          type: 'out_of_stock',
          itemId: item.id,
          productId: item.product_id,
          productName: product.name,
          message: `${product.name} has insufficient stock (${product.stock_quantity} available)`,
          severity: 'warning'
        })
      }
    }

    return issues

  } catch (error) {
    logger.error('Error validating cart items:', error)
    return []
  }
}

/**
 * Auto-fix cart issues where possible
 */
export async function autoFixCartIssues(cartId: string): Promise<{
  fixed: number
  removed: number
  issues: CartIssue[]
}> {
  try {
    const supabase = await createClerkSupabaseClient()
    let fixed = 0
    let removed = 0

    const issues = await validateCartItems(cartId)

    for (const issue of issues) {
      if (issue.type === 'product_deleted' || issue.type === 'product_inactive') {
        // Remove unavailable items
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', issue.itemId)

        if (!error) {
          removed++
        }
      } else if (issue.type === 'out_of_stock') {
        // Adjust quantity to available stock
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', issue.productId)
          .single()

        if (product && product.stock_quantity > 0) {
          const { error } = await supabase
            .from('cart_items')
            .update({ 
              quantity: product.stock_quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', issue.itemId)

          if (!error) {
            fixed++
          }
        }
      }
    }

    // Get remaining issues
    const remainingIssues = await validateCartItems(cartId)

    return {
      fixed,
      removed,
      issues: remainingIssues
    }

  } catch (error) {
    logger.error('Error auto-fixing cart issues:', error)
    return { fixed: 0, removed: 0, issues: [] }
  }
}

/**
 * Handle verification status change
 * Updates cart pricing visibility when business gets verified/unverified
 */
export async function handleVerificationStatusChange(
  userId: string,
  isVerified: boolean
): Promise<void> {
  try {
    // This is more of a client-side concern since pricing is derived
    // But we can log it for analytics
    logger.info('Verification status changed', {
      userId,
      isVerified,
      timestamp: new Date().toISOString()
    })

    // Future: Send notification to user about pricing access
    // Future: Update any cached pricing data

  } catch (error) {
    logger.error('Error handling verification status change:', error)
  }
}

/**
 * Detect price changes for cart items
 */
export async function detectPriceChanges(
  items: DerivedCartItem[],
  previousPrices: Record<string, number>
): Promise<Array<{
  itemId: string
  productName: string
  oldPrice: number
  newPrice: number
  change: number
  changePercent: number
}>> {
  const changes = []

  for (const item of items) {
    const previousPrice = previousPrices[item.id]
    if (previousPrice && previousPrice !== item.unit_price) {
      const change = item.unit_price - previousPrice
      const changePercent = (change / previousPrice) * 100

      changes.push({
        itemId: item.id,
        productName: item.title,
        oldPrice: previousPrice,
        newPrice: item.unit_price,
        change,
        changePercent: Math.round(changePercent * 100) / 100
      })
    }
  }

  return changes
}
