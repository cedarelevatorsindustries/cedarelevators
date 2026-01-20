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

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'
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
} from '@/lib/actions/cart'
import {
  checkCartLockStatus,
  CartLockStatus
} from '@/lib/actions/cart-locking'
import { getCartWithPricing } from '@/lib/actions/pricing'
import { logger } from '@/lib/services/logger'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
  addItem: (productId: string, variantId: string | null, quantity: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCartItems: () => Promise<void>
}

const CartContext = createContext<CartContextState | undefined>(undefined)

import { useUserPricing } from '@/lib/hooks/useUserPricing'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth()
  const { userType: pricingUserType, isVerified } = useUserPricing()

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
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  // Debounce ref for realtime refresh
  const refreshDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const isExternalUpdate = useRef(false)

  // Refresh cart data with debouncing for realtime updates
  const refreshCart = useCallback(async (silent = false) => {
    if (!isSignedIn) {
      setIsLoading(false)
      return
    }

    // Clear existing debounce timer
    if (refreshDebounceRef.current) {
      clearTimeout(refreshDebounceRef.current)
    }

    // Debounce refresh to prevent excessive calls
    refreshDebounceRef.current = setTimeout(async () => {
      try {
        if (!silent) setIsLoading(true)
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

        // Map pricing user type to cart user type
        let userType: UserType = 'guest'
        if (pricingUserType === 'business' && isVerified) {
          userType = 'business_verified'
        } else if (pricingUserType === 'business' && !isVerified) {
          userType = 'business_unverified'
        } else if (pricingUserType === 'individual') {
          userType = 'individual'
        }

        // Get user context (from cart and pricing hook)
        const userContext: CartContextType = {
          userId: userId!,
          profileType: fetchedCart.profile_type,
          businessId: fetchedCart.business_id || undefined,
          userType: userType,
          isVerified: isVerified
        }
        setContext(userContext)

        console.log('[CartContext] User context:', userContext)

        // Get cart with pricing
        const { items, summary: calculatedSummary } = await getCartWithPricing(
          fetchedCart.id,
          { userType: userContext.userType, businessId: userContext.businessId, isVerified: userContext.isVerified }
        )

        setDerivedItems(items)
        setSummary(calculatedSummary)

      } catch (err) {
        logger.error('Error refreshing cart', err)
        setError('Failed to load cart')
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce
  }, [isSignedIn, userId, pricingUserType, isVerified])

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

  // Add item to cart
  const addItem = useCallback(async (productId: string, variantId: string | null, quantity: number) => {
    try {
      const result = await (await import('@/lib/actions/cart')).addItemToCart({
        productId,
        variantId: variantId || undefined,
        quantity
      })
      if (result.success) {
        await refreshCart()
      } else {
        throw new Error(result.error || 'Failed to add item')
      }
    } catch (err) {
      logger.error('Error adding item to cart', err)
      throw err
    }
  }, [refreshCart])

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const result = await (await import('@/lib/actions/cart')).updateCartItemQuantity({
        cartItemId: itemId,
        quantity
      })
      if (result.success) {
        await refreshCart()
      } else {
        throw new Error(result.error || 'Failed to update quantity')
      }
    } catch (err) {
      logger.error('Error updating quantity', err)
      throw err
    }
  }, [refreshCart])

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    try {
      const result = await (await import('@/lib/actions/cart')).removeCartItem(itemId)
      if (result.success) {
        await refreshCart()
      } else {
        throw new Error(result.error || 'Failed to remove item')
      }
    } catch (err) {
      logger.error('Error removing item', err)
      throw err
    }
  }, [refreshCart])

  // Clear all cart items
  const clearCartItems = useCallback(async () => {
    try {
      if (!cart?.id) return
      const result = await (await import('@/lib/actions/cart')).clearCart(cart.id)
      if (result.success) {
        await refreshCart()
      } else {
        throw new Error(result.error || 'Failed to clear cart')
      }
    } catch (err) {
      logger.error('Error clearing cart', err)
      throw err
    }
  }, [cart?.id, refreshCart])

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

  // Realtime subscription for cart synchronization across devices
  useEffect(() => {
    if (!cart?.id || !isSignedIn) {
      // Cleanup existing subscription if cart is cleared
      if (realtimeChannel) {
        realtimeChannel.unsubscribe()
        setRealtimeChannel(null)
      }
      return
    }

    const setupRealtimeSubscription = async () => {
      try {
        const supabase = createClient()

        console.log(`[Realtime] Setting up subscription for cart: ${cart.id}`)

        // Subscribe to cart_items changes for this specific cart
        const channel = supabase
          .channel(`cart:${cart.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cart_items',
              filter: `cart_id=eq.${cart.id}`
            },
            (payload) => {
              console.log('[Realtime] Cart item changed:', payload)

              // Mark as external update to prevent showing toast on own actions
              isExternalUpdate.current = true

              // Refresh cart silently (no loading state)
              refreshCart(true)

              // Show notification for external changes only
              // We detect external changes by checking if this is an INSERT/UPDATE/DELETE
              // that wasn't triggered by the current user's action
              if (payload.eventType === 'INSERT') {
                toast.info('Cart updated from another device', {
                  description: 'New item added to your cart',
                  duration: 3000
                })
              } else if (payload.eventType === 'UPDATE') {
                toast.info('Cart updated from another device', {
                  description: 'Item quantity changed',
                  duration: 3000
                })
              } else if (payload.eventType === 'DELETE') {
                toast.info('Cart updated from another device', {
                  description: 'Item removed from your cart',
                  duration: 3000
                })
              }

              // Reset external update flag after a short delay
              setTimeout(() => {
                isExternalUpdate.current = false
              }, 1000)
            }
          )
          .subscribe((status) => {
            console.log('[Realtime] Subscription status:', status)
            if (status === 'SUBSCRIBED') {
              logger.info('Realtime cart subscription active', { cartId: cart.id })
            } else if (status === 'CLOSED') {
              logger.warn('Realtime cart subscription closed', { cartId: cart.id })
            } else if (status === 'CHANNEL_ERROR') {
              logger.error('Realtime cart subscription error', { cartId: cart.id })
            }
          })

        setRealtimeChannel(channel)
      } catch (error) {
        logger.error('Failed to setup realtime subscription', error)
      }
    }

    setupRealtimeSubscription()

    // Cleanup on unmount or cart change
    return () => {
      if (realtimeChannel) {
        console.log('[Realtime] Cleaning up subscription')
        realtimeChannel.unsubscribe()
        setRealtimeChannel(null)
      }
      // Clear debounce timer
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current)
      }
    }
  }, [cart?.id, isSignedIn, refreshCart])

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
        refreshLockStatus,
        addItem,
        updateQuantity,
        removeItem,
        clearCartItems
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

