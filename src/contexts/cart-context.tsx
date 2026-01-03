/**
 * Cart Context with Lock Support
 * Cedar Elevator Industries
 * 
 * Enhanced cart context with:
 * - Cart locking support
 * - Lock status polling
 * - Auto-refresh on lock changes
 */

'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { 
  Cart, 
  CartContext as CartContextType,
  DerivedCartItem,
  CartSummary,
  UserType,
  ProfileType
} from '@/types/cart.types'
import { 
  getUserActiveCart, 
  getCartItemCount,
  switchCartContext
} from '@/lib/actions/cart-v2'
import { 
  checkCartLockStatus,
  CartLockStatus 
} from '@/lib/actions/cart-locking'
import { getCartWithPricing } from '@/lib/services/cart-pricing'
import { logger } from '@/lib/services/logger'

interface CartContextState {
  cart: Cart | null
  derivedItems: DerivedCartItem[]
  summary: CartSummary
  isLoading: boolean
  error: string | null
  context: CartContextType | null
  lockStatus: CartLockStatus | null
  refreshCart: () => Promise<void>
  switchProfile: (profileType: ProfileType, businessId?: string) => Promise<void>
  refreshLockStatus: () => Promise<void>
}

const CartContext = createContext<CartContextState | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth()
  
  const [cart, setCart] = useState<Cart | null>(null)
  const [derivedItems, setDerivedItems] = useState<DerivedCartItem[]>([])
  const [summary, setSummary] = useState<CartSummary>({
    itemCount: 0,
    uniqueProducts: 0,
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    hasUnavailableItems: false,
    hasOutOfStockItems: false,
    canCheckout: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [context, setContext] = useState<CartContextType | null>(null)
  const [lockStatus, setLockStatus] = useState<CartLockStatus | null>(null)

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    if (!isSignedIn) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get active cart
      const cartResult = await getUserActiveCart()
      if (!cartResult.success || !cartResult.data) {
        setCart(null)
        setDerivedItems([])
        setIsLoading(false)
        return
      }

      const fetchedCart = cartResult.data
      setCart(fetchedCart)

      // Get user context (from cart or derive)
      const userContext: CartContextType = {
        userId: userId!,
        profileType: fetchedCart.profile_type,
        businessId: fetchedCart.business_id || undefined,
        userType: 'individual', // TODO: Derive from user metadata
        isVerified: false
      }
      setContext(userContext)

      // Get cart with pricing
      const { items, summary: calculatedSummary } = await getCartWithPricing(
        fetchedCart.id,
        { userType: userContext.userType, businessId: userContext.businessId }
      )

      setDerivedItems(items)
      setSummary(calculatedSummary)

    } catch (err) {
      logger.error('Error refreshing cart', err)
      setError('Failed to load cart')
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn, userId])

  // Refresh lock status
  const refreshLockStatus = useCallback(async () => {
    if (!cart?.id) return

    try {
      const result = await checkCartLockStatus(cart.id)
      if (result.success && result.data) {
        setLockStatus(result.data)
      }
    } catch (err) {
      logger.error('Error checking lock status', err)
    }
  }, [cart?.id])

  // Switch profile
  const switchProfile = useCallback(async (profileType: ProfileType, businessId?: string) => {
    try {
      setIsLoading(true)
      const result = await switchCartContext(profileType, businessId)
      if (result.success) {
        await refreshCart()
      }
    } catch (err) {
      logger.error('Error switching profile', err)
      setError('Failed to switch profile')
    } finally {
      setIsLoading(false)
    }
  }, [refreshCart])

  // Initial load
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Poll lock status every 10 seconds when cart exists
  useEffect(() => {
    if (!cart?.id) return

    refreshLockStatus()
    const interval = setInterval(refreshLockStatus, 10000) // Poll every 10s

    return () => clearInterval(interval)
  }, [cart?.id, refreshLockStatus])

  return (
    <CartContext.Provider
      value={{
        cart,
        derivedItems,
        summary,
        isLoading,
        error,
        context,
        lockStatus,
        refreshCart,
        switchProfile,
        refreshLockStatus
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
