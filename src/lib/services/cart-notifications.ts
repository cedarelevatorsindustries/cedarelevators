/**
 * Cart Notification Manager
 * Cedar Elevator Industries
 * 
 * Handles various cart-related notifications:
 * - Item added/removed
 * - Price changes
 * - Stock warnings
 * - Verification status changes
 */

import { toast } from 'sonner'
import { CartIssue } from '@/lib/services/cart-edge-cases'

/**
 * Show item added notification
 */
export function notifyItemAdded(productName: string, quantity: number = 1) {
  toast.success(`${productName} added to cart`, {
    description: quantity > 1 ? `Quantity: ${quantity}` : undefined,
    duration: 2000
  })
}

/**
 * Show item removed notification
 */
export function notifyItemRemoved(productName: string) {
  toast.success(`${productName} removed from cart`, {
    duration: 2000
  })
}

/**
 * Show quantity updated notification
 */
export function notifyQuantityUpdated(productName: string, newQuantity: number) {
  toast.success(`Updated ${productName}`, {
    description: `New quantity: ${newQuantity}`,
    duration: 1500
  })
}

/**
 * Show cart cleared notification
 */
export function notifyCartCleared(itemCount: number) {
  toast.success('Cart cleared', {
    description: `${itemCount} ${itemCount === 1 ? 'item' : 'items'} removed`,
    duration: 2000
  })
}

/**
 * Show cart merged notification
 */
export function notifyCartMerged(itemsAdded: number, itemsUpdated: number) {
  const total = itemsAdded + itemsUpdated
  if (total === 0) return

  toast.success('Cart synced', {
    description: `${total} ${total === 1 ? 'item' : 'items'} merged from guest cart`,
    duration: 3000
  })
}

/**
 * Show profile switched notification
 */
export function notifyProfileSwitched(profileType: 'individual' | 'business') {
  toast.success(`Switched to ${profileType} cart`, {
    duration: 2000
  })
}

/**
 * Show price change notification
 */
export function notifyPriceChange(
  productName: string,
  oldPrice: number,
  newPrice: number,
  isIncrease: boolean
) {
  const change = Math.abs(newPrice - oldPrice)
  const changePercent = Math.round((change / oldPrice) * 100)

  toast.info(`Price update for ${productName}`, {
    description: `${isIncrease ? 'Increased' : 'Decreased'} by ₹${change.toLocaleString()} (${changePercent}%)`,
    duration: 5000
  })
}

/**
 * Show cart validation issues
 */
export function notifyCartIssues(issues: CartIssue[]) {
  if (issues.length === 0) return

  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  if (errors.length > 0) {
    toast.error('Cart has issues', {
      description: `${errors.length} ${errors.length === 1 ? 'item needs' : 'items need'} attention`,
      duration: 5000
    })
  } else if (warnings.length > 0) {
    toast.warning('Stock warning', {
      description: `${warnings.length} ${warnings.length === 1 ? 'item has' : 'items have'} limited stock`,
      duration: 4000
    })
  }
}

/**
 * Show verification status change notification
 */
export function notifyVerificationStatusChange(isVerified: boolean) {
  if (isVerified) {
    toast.success('Account verified!', {
      description: 'You can now place orders and view pricing',
      duration: 5000
    })
  } else {
    toast.warning('Verification status changed', {
      description: 'Checkout access has been updated',
      duration: 4000
    })
  }
}

/**
 * Show out of stock notification
 */
export function notifyOutOfStock(productName: string, availableStock: number) {
  if (availableStock === 0) {
    toast.error(`${productName} is out of stock`, {
      description: 'This item has been removed from your cart',
      duration: 4000
    })
  } else {
    toast.warning(`Limited stock for ${productName}`, {
      description: `Only ${availableStock} available. Quantity adjusted.`,
      duration: 4000
    })
  }
}

/**
 * Show cart limit reached notification
 */
export function notifyCartLimitReached(limit: number) {
  toast.error('Cart limit reached', {
    description: `Maximum ${limit} items allowed in cart`,
    duration: 3000
  })
}

/**
 * Show checkout blocked notification
 */
export function notifyCheckoutBlocked(reason: 'guest' | 'individual' | 'unverified' | 'cart_issues') {
  const messages = {
    guest: 'Please sign in to proceed to checkout',
    individual: 'Business account required for checkout',
    unverified: 'Account verification required for checkout',
    cart_issues: 'Please fix cart issues before checkout'
  }

  toast.error('Checkout unavailable', {
    description: messages[reason],
    duration: 4000
  })
}
