/**
 * Guest Cart Service (Client-Side)
 * Cedar Elevator Industries
 * 
 * Manages guest cart in localStorage:
 * - Add/update/remove items
 * - 50 item limit
 * - Prepare for merge on login
 */

import { 
  GuestCart, 
  GuestCartItem, 
  GUEST_CART_KEY, 
  GUEST_CART_MAX_ITEMS 
} from '@/types/cart.types'

// =====================================================
// Get Guest Cart from localStorage
// =====================================================

export function getGuestCart(): GuestCart | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(GUEST_CART_KEY)
    if (!stored) return null

    const cart = JSON.parse(stored) as GuestCart
    return cart
  } catch (error) {
    console.error('Error reading guest cart:', error)
    return null
  }
}

// =====================================================
// Save Guest Cart to localStorage
// =====================================================

export function saveGuestCart(cart: GuestCart): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
    return true
  } catch (error) {
    console.error('Error saving guest cart:', error)
    return false
  }
}

// =====================================================
// Initialize Empty Guest Cart
// =====================================================

export function initGuestCart(): GuestCart {
  const cart: GuestCart = {
    id: crypto.randomUUID(),
    items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  saveGuestCart(cart)
  return cart
}

// =====================================================
// Add to Guest Cart
// =====================================================

export function addToGuestCart(
  productId: string,
  title: string,
  thumbnail: string | undefined,
  quantity: number,
  variantId?: string
): { success: boolean; error?: string; itemCount?: number } {
  try {
    let cart = getGuestCart()
    if (!cart) {
      cart = initGuestCart()
    }

    // Check item limit
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    if (totalItems + quantity > GUEST_CART_MAX_ITEMS) {
      return { 
        success: false, 
        error: `Cart limit reached (${GUEST_CART_MAX_ITEMS} items max)` 
      }
    }

    // Find existing item
    const existingIndex = cart.items.findIndex(
      item => item.product_id === productId && 
              (item.variant_id || null) === (variantId || null)
    )

    if (existingIndex >= 0) {
      // Update quantity
      cart.items[existingIndex].quantity += quantity
    } else {
      // Add new item
      const newItem: GuestCartItem = {
        product_id: productId,
        variant_id: variantId,
        title,
        thumbnail,
        quantity,
        added_at: new Date().toISOString()
      }
      cart.items.push(newItem)
    }

    cart.updated_at = new Date().toISOString()
    saveGuestCart(cart)

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    return { success: true, itemCount }

  } catch (error) {
    console.error('Error adding to guest cart:', error)
    return { success: false, error: 'Failed to add item' }
  }
}

// =====================================================
// Update Guest Cart Item Quantity
// =====================================================

export function updateGuestCartItem(
  productId: string,
  quantity: number,
  variantId?: string
): { success: boolean; error?: string } {
  try {
    const cart = getGuestCart()
    if (!cart) return { success: false, error: 'Cart not found' }

    const itemIndex = cart.items.findIndex(
      item => item.product_id === productId && 
              (item.variant_id || null) === (variantId || null)
    )

    if (itemIndex < 0) {
      return { success: false, error: 'Item not found' }
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }

    cart.updated_at = new Date().toISOString()
    saveGuestCart(cart)

    return { success: true }

  } catch (error) {
    console.error('Error updating guest cart item:', error)
    return { success: false, error: 'Failed to update item' }
  }
}

// =====================================================
// Remove from Guest Cart
// =====================================================

export function removeFromGuestCart(
  productId: string,
  variantId?: string
): { success: boolean; error?: string } {
  try {
    const cart = getGuestCart()
    if (!cart) return { success: false, error: 'Cart not found' }

    cart.items = cart.items.filter(
      item => !(item.product_id === productId && 
                (item.variant_id || null) === (variantId || null))
    )

    cart.updated_at = new Date().toISOString()
    saveGuestCart(cart)

    return { success: true }

  } catch (error) {
    console.error('Error removing from guest cart:', error)
    return { success: false, error: 'Failed to remove item' }
  }
}

// =====================================================
// Clear Guest Cart
// =====================================================

export function clearGuestCart(): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.removeItem(GUEST_CART_KEY)
    return true
  } catch (error) {
    console.error('Error clearing guest cart:', error)
    return false
  }
}

// =====================================================
// Get Guest Cart Item Count
// =====================================================

export function getGuestCartCount(): number {
  const cart = getGuestCart()
  if (!cart) return 0

  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}

// =====================================================
// Check if Guest Cart Exists
// =====================================================

export function hasGuestCart(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(GUEST_CART_KEY) !== null
}

// =====================================================
// Get Guest Cart Items (for display)
// =====================================================

export function getGuestCartItems(): GuestCartItem[] {
  const cart = getGuestCart()
  return cart?.items || []
}
