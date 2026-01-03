/**
 * Cart Context & Provider
 * Cedar Elevator Industries
 * 
 * Provides cart state management:
 * - Cart data with derived pricing
 * - Cart actions (add, update, remove)
 * - Profile switching
 * - Guest cart handling
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import {
  Cart,
  DerivedCartItem,
  CartSummary,
  CartContext as CartContextType,
  ProfileType,
  UserType,
  CartState
} from '@/types/cart.types'
import {
  getUserActiveCart,
  addItemToCart as addItemToCartAction,
  updateCartItemQuantity as updateCartItemAction,
  removeCartItem as removeCartItemAction,
  clearCart as clearCartAction,
  switchCartContext as switchCartContextAction,
  getCartItemCount
} from '@/lib/actions/cart-v2'
import { getCartWithPricing } from '@/lib/services/cart-pricing'
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  getGuestCartCount,
  hasGuestCart
} from '@/lib/services/guest-cart'
import { mergeGuestCartToUser } from '@/lib/services/cart-merge'
import { toast } from 'sonner'

// =====================================================
// Context Type
// =====================================================

interface CartContextValue extends CartState {
  // Actions
  addItem: (productId: string, title: string, thumbnail: string | undefined, quantity: number, variantId?: string) => Promise<void>
  updateQuantity: (cartItemId: string, productId: string, quantity: number, variantId?: string) => Promise<void>
  removeItem: (cartItemId: string, productId: string, variantId?: string) => Promise<void>
  clearCartItems: () => Promise<void>
  switchProfile: (newProfile: ProfileType, businessId?: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

// =====================================================
// Cart Provider
// =====================================================

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()

  const [state, setState] = useState<CartState>({
    cart: null,
    derivedItems: [],
    summary: {
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
    },
    isLoading: false,
    error: null,
    context: null
  })

  // =====================================================
  // Determine User Context
  // =====================================================

  const getUserContext = useCallback(async (): Promise<CartContextType | null> => {
    if (!isSignedIn || !userId) return null

    const accountType = user?.publicMetadata?.accountType as string || 'individual'
    const profileType: ProfileType = accountType === 'business' ? 'business' : 'individual'

    // Determine user type
    let userType: UserType = 'individual'
    if (accountType === 'business') {
      const verificationStatus = user?.publicMetadata?.verificationStatus as string
      userType = verificationStatus === 'verified' ? 'business_verified' : 'business_unverified'
    }

    return {
      userId,
      profileType,
      userType,
      isVerified: userType === 'business_verified'
    }
  }, [isSignedIn, userId, user])

  // =====================================================
  // Load Cart
  // =====================================================

  const loadCart = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      if (!isSignedIn) {
        // Guest user - use localStorage
        const guestCart = getGuestCart()
        const itemCount = getGuestCartCount()

        setState(prev => ({
          ...prev,
          cart: null,
          derivedItems: [],
          summary: {
            itemCount,
            uniqueProducts: guestCart?.items.length || 0,
            subtotal: 0,
            discount: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            hasUnavailableItems: false,
            hasOutOfStockItems: false,
            canCheckout: false
          },
          isLoading: false,
          context: null
        }))
        return
      }

      // Authenticated user
      const context = await getUserContext()
      if (!context) {
        setState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Get cart
      const cartResult = await getUserActiveCart(context.profileType, context.businessId)
      if (!cartResult.success || !cartResult.data) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          context 
        }))
        return
      }

      // Get cart with pricing
      const { items, summary } = await getCartWithPricing(cartResult.data.id, context)

      setState(prev => ({
        ...prev,
        cart: cartResult.data || null,
        derivedItems: items,
        summary,
        isLoading: false,
        context
      }))

    } catch (error) {
      console.error('Error loading cart:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to load cart'
      }))
    }
  }, [isSignedIn, getUserContext])

  // =====================================================
  // Merge Guest Cart on Login
  // =====================================================

  useEffect(() => {
    const mergeGuestCart = async () => {
      if (isSignedIn && userId && hasGuestCart()) {
        const guestCart = getGuestCart()
        if (!guestCart || guestCart.items.length === 0) {
          clearGuestCart()
          return
        }

        const context = await getUserContext()
        if (!context) return

        const result = await mergeGuestCartToUser(
          guestCart.items,
          userId,
          context.profileType,
          context.businessId
        )

        if (result.success) {
          const totalItems = result.itemsAdded + result.itemsUpdated
          if (totalItems > 0) {
            toast.success(`${totalItems} item${totalItems > 1 ? 's' : ''} added to your cart`)
          }
          clearGuestCart()
          loadCart()
        } else {
          toast.error('Some items could not be added to your cart')
        }
      }
    }

    mergeGuestCart()
  }, [isSignedIn, userId, getUserContext, loadCart])

  // =====================================================
  // Load cart on mount and auth change
  // =====================================================

  useEffect(() => {
    loadCart()
  }, [loadCart])

  // =====================================================
  // Add Item
  // =====================================================

  const addItem = async (
    productId: string,
    title: string,
    thumbnail: string | undefined,
    quantity: number,
    variantId?: string
  ) => {
    try {
      if (!isSignedIn) {
        // Guest cart
        const result = addToGuestCart(productId, title, thumbnail, quantity, variantId)
        if (result.success) {
          toast.success('Added to cart')
          loadCart()
        } else {
          toast.error(result.error || 'Failed to add item')
        }
        return
      }

      // Authenticated user
      const result = await addItemToCartAction({ productId, variantId, quantity })
      if (result.success) {
        toast.success('Added to cart')
        loadCart()
      } else {
        toast.error(result.error || 'Failed to add item')
      }

    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item to cart')
    }
  }

  // =====================================================
  // Update Quantity
  // =====================================================

  const updateQuantity = async (
    cartItemId: string,
    productId: string,
    quantity: number,
    variantId?: string
  ) => {
    try {
      if (!isSignedIn) {
        // Guest cart
        const result = updateGuestCartItem(productId, quantity, variantId)
        if (result.success) {
          loadCart()
        } else {
          toast.error(result.error || 'Failed to update quantity')
        }
        return
      }

      // Authenticated user
      const result = await updateCartItemAction({ cartItemId, quantity })
      if (result.success) {
        loadCart()
      } else {
        toast.error(result.error || 'Failed to update quantity')
      }

    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }

  // =====================================================
  // Remove Item
  // =====================================================

  const removeItem = async (
    cartItemId: string,
    productId: string,
    variantId?: string
  ) => {
    try {
      if (!isSignedIn) {
        // Guest cart
        const result = removeFromGuestCart(productId, variantId)
        if (result.success) {
          toast.success('Item removed')
          loadCart()
        } else {
          toast.error(result.error || 'Failed to remove item')
        }
        return
      }

      // Authenticated user
      const result = await removeCartItemAction(cartItemId)
      if (result.success) {
        toast.success('Item removed')
        loadCart()
      } else {
        toast.error(result.error || 'Failed to remove item')
      }

    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  // =====================================================
  // Clear Cart
  // =====================================================

  const clearCartItems = async () => {
    try {
      if (!isSignedIn) {
        clearGuestCart()
        toast.success('Cart cleared')
        loadCart()
        return
      }

      const result = await clearCartAction()
      if (result.success) {
        toast.success('Cart cleared')
        loadCart()
      } else {
        toast.error(result.error || 'Failed to clear cart')
      }

    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    }
  }

  // =====================================================
  // Switch Profile
  // =====================================================

  const switchProfile = async (newProfile: ProfileType, businessId?: string) => {
    try {
      const result = await switchCartContextAction(newProfile, businessId)
      if (result.success) {
        toast.success(`Switched to ${newProfile} cart`)
        loadCart()
      } else {
        toast.error(result.error || 'Failed to switch profile')
      }

    } catch (error) {
      console.error('Error switching profile:', error)
      toast.error('Failed to switch profile')
    }
  }

  // =====================================================
  // Refresh Cart
  // =====================================================

  const refreshCart = async () => {
    await loadCart()
  }

  // =====================================================
  // Context Value
  // =====================================================

  const value: CartContextValue = {
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCartItems,
    switchProfile,
    refreshCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// =====================================================
// useCart Hook
// =====================================================

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
