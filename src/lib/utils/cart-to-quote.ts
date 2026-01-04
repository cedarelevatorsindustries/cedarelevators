/**
 * Cart to Quote Integration Helper
 * Cedar Elevator Industries
 * 
 * Helpers to pre-fill quote forms from cart data
 */

import { DerivedCartItem } from '@/types/cart.types'

export interface QuoteItemInput {
  productId: string
  variantId?: string | null
  title: string
  thumbnail?: string | null
  quantity: number
  specifications?: string
  notes?: string
}

/**
 * Convert cart items to quote items format
 */
export function cartItemsToQuoteItems(cartItems: DerivedCartItem[]): QuoteItemInput[] {
  return cartItems
    .filter(item => item.is_available) // Only include available items
    .map(item => ({
      productId: item.product_id,
      variantId: item.variant_id,
      title: item.title,
      thumbnail: item.thumbnail,
      quantity: item.quantity,
      specifications: item.variant?.name || '',
      notes: ''
    }))
}

/**
 * Build quote request URL with cart items as params
 */
export function buildQuoteUrlFromCart(cartItems: DerivedCartItem[], source?: string): string {
  const params = new URLSearchParams()
  
  if (source) {
    params.set('source', source)
  }
  
  // Add cart flag
  params.set('fromCart', 'true')
  
  // Add item count
  params.set('itemCount', cartItems.length.toString())
  
  // For single item, add direct params
  if (cartItems.length === 1) {
    const item = cartItems[0]
    params.set('productId', item.product_id)
    if (item.variant_id) {
      params.set('variantId', item.variant_id)
    }
    params.set('quantity', item.quantity.toString())
  }
  
  return `/request-quote?${params.toString()}`
}

/**
 * Store cart items in session storage for quote prefill
 * (Alternative to URL params for large carts)
 */
export function storeCartItemsForQuote(cartItems: DerivedCartItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const quoteItems = cartItemsToQuoteItems(cartItems)
    sessionStorage.setItem('quote_prefill_items', JSON.stringify(quoteItems))
  } catch (error) {
    console.error('Error storing cart items for quote:', error)
  }
}

/**
 * Retrieve stored cart items for quote prefill
 */
export function getStoredQuoteItems(): QuoteItemInput[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = sessionStorage.getItem('quote_prefill_items')
    if (!stored) return null
    
    return JSON.parse(stored) as QuoteItemInput[]
  } catch (error) {
    console.error('Error retrieving stored quote items:', error)
    return null
  }
}

/**
 * Clear stored quote items
 */
export function clearStoredQuoteItems(): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.removeItem('quote_prefill_items')
  } catch (error) {
    console.error('Error clearing stored quote items:', error)
  }
}

/**
 * Check if quote should be prefilled from cart
 */
export function shouldPrefillFromCart(): boolean {
  if (typeof window === 'undefined') return false
  
  const params = new URLSearchParams(window.location.search)
  return params.get('fromCart') === 'true' || params.get('source') === 'cart'
}

