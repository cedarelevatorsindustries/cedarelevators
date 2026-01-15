/**
 * Cart Conversion Handler
 * Cedar Elevator Industries
 * 
 * Handles cart conversion to order/quote with proper state management
 */

'use server'

import { convertCart } from '@/lib/actions/cart'
import { CartActionResponse } from '@/types/cart.types'

/**
 * Convert cart to order (after successful checkout)
 */
export async function convertCartToOrder(
  cartId: string
): Promise<CartActionResponse<void>> {
  try {
    const result = await convertCart(cartId, 'order')
    return result
  } catch (error) {
    console.error('Error converting cart to order:', error)
    return {
      success: false,
      error: 'Failed to convert cart to order'
    }
  }
}

/**
 * Convert cart to quote (after quote submission)
 */
export async function convertCartToQuote(
  cartId: string
): Promise<CartActionResponse<void>> {
  try {
    const result = await convertCart(cartId, 'quote')
    return result
  } catch (error) {
    console.error('Error converting cart to quote:', error)
    return {
      success: false,
      error: 'Failed to convert cart to quote'
    }
  }
}

