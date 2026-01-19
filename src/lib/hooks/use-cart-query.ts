/**
 * React Query Cart Hooks
 * Cedar Elevator Industries
 * 
 * Optimized cart state management with React Query:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Perfect for mobile (auto-retry, offline support)
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  getUserActiveCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getCartItemCount
} from '@/lib/actions/cart'
import {
  lockCartForCheckout,
  unlockCart,
  checkCartLockStatus
} from '@/lib/actions/cart-locking'
import { getCartWithPricing } from '@/lib/actions/pricing'
import {
  Cart,
  DerivedCartItem,
  CartSummary,
  AddToCartPayload,
  UpdateCartItemPayload,
  UserType
} from '@/types/cart.types'
import { toast } from 'sonner'

// =====================================================
// Query Keys
// =====================================================

export const cartKeys = {
  all: ['cart'] as const,
  cart: (userId: string | null) => [...cartKeys.all, userId] as const,
  cartWithPricing: (cartId: string, userType: UserType) =>
    [...cartKeys.all, 'pricing', cartId, userType] as const,
  count: (userId: string | null) => [...cartKeys.all, 'count', userId] as const,
  lockStatus: (cartId: string) => [...cartKeys.all, 'lock', cartId] as const,
}

// =====================================================
// Hook: useCartQuery
// Fetches active cart with automatic caching and refetching
// =====================================================

export function useCartQuery() {
  const { isSignedIn, userId: clerkUserId } = useAuth()
  const userId = clerkUserId || null

  return useQuery({
    queryKey: cartKeys.cart(userId),
    queryFn: async () => {
      if (!isSignedIn) return null

      const result = await getUserActiveCart()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch cart')
      }
      return result.data || null
    },
    enabled: isSignedIn,
    staleTime: 1000 * 30, // 30 seconds - faster updates
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnReconnect: true, // Refresh on network reconnection
    refetchInterval: false, // Don't poll automatically
    retry: 2 // Retry failed requests twice (good for mobile)
  })
}

// =====================================================
// Hook: useCartWithPricing
// Fetches cart with derived pricing
// =====================================================

export function useCartWithPricing(userType: UserType) {
  const { userId } = useAuth()
  const { data: cart } = useCartQuery()

  return useQuery({
    queryKey: cartKeys.cartWithPricing(cart?.id || '', userType),
    queryFn: async () => {
      if (!cart?.id) return { items: [], summary: getEmptySummary() }

      return await getCartWithPricing(cart.id, { userType })
    },
    enabled: !!cart?.id,
    staleTime: 1000 * 30, // 30 seconds (pricing can change)
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true
  })
}

// =================================0====================
// Hook: useCartItemCount
// Optimized count query (lighter than full cart)
// =====================================================

export function useCartItemCount() {
  const { isSignedIn, userId: clerkUserId } = useAuth()
  const userId = clerkUserId || null

  return useQuery({
    queryKey: cartKeys.count(userId),
    queryFn: async () => {
      if (!isSignedIn) return 0

      const result = await getCartItemCount()
      return result.data || 0
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true
  })
}

// =====================================================
// Hook: useCartLockStatus
// Polls lock status
// =====================================================

export function useCartLockStatus(cartId?: string) {
  return useQuery({
    queryKey: cartKeys.lockStatus(cartId || ''),
    queryFn: async () => {
      if (!cartId) return null

      const result = await checkCartLockStatus(cartId)
      return result.data || null
    },
    enabled: !!cartId,
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
    gcTime: 1000 * 60
  })
}

// =====================================================
// Mutation: useAddToCart
// Optimistic update for instant UI feedback
// =====================================================

export function useAddToCart() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { userId: clerkUserId } = useAuth()
  const userId = clerkUserId || null

  return useMutation({
    mutationFn: async (payload: AddToCartPayload) => {
      const result = await addItemToCart(payload)
      if (!result.success) {
        throw new Error(result.error || 'Failed to add item')
      }
      return result.data
    },
    onMutate: async (payload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.cart(userId) })

      // Optimistically update count
      queryClient.setQueryData(cartKeys.count(userId), (old: number = 0) => old + payload.quantity)
    },
    onSuccess: async () => {
      // Invalidate all cart queries and explicitly refetch
      await queryClient.invalidateQueries({ queryKey: cartKeys.all })
      // Force refetch to ensure cart appears in UI immediately
      await queryClient.refetchQueries({
        queryKey: cartKeys.cart(userId),
        exact: false
      })
      // Refresh Next.js cache to update server components
      router.refresh()
      toast.success('Added to cart')
    },
    onError: (error: Error) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: cartKeys.count(userId) })
      toast.error(error.message || 'Failed to add to cart')
    }
  })
}

// =====================================================
// Mutation: useUpdateCartItem
// =====================================================

export function useUpdateCartItem() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { userId: clerkUserId } = useAuth()
  const userId = clerkUserId || null

  return useMutation({
    mutationFn: async (payload: UpdateCartItemPayload) => {
      const result = await updateCartItemQuantity(payload)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update item')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart(userId) })
      queryClient.invalidateQueries({ queryKey: cartKeys.count(userId) })
      router.refresh()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quantity')
    }
  })
}

// =====================================================
// Mutation: useRemoveCartItem
// =====================================================

export function useRemoveCartItem() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { userId: clerkUserId } = useAuth()
  const userId = clerkUserId || null

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const result = await removeCartItem(cartItemId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove item')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart(userId) })
      queryClient.invalidateQueries({ queryKey: cartKeys.count(userId) })
      router.refresh()
      toast.success('Removed from cart')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove item')
    }
  })
}

// =====================================================
// Mutation: useClearCart
// =====================================================

export function useClearCart() {
  const queryClient = useQueryClient()
  const { userId: clerkUserId } = useAuth()
  const userId = clerkUserId || null

  return useMutation({
    mutationFn: async (cartId?: string) => {
      const result = await clearCart(cartId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to clear cart')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart(userId) })
      queryClient.invalidateQueries({ queryKey: cartKeys.count(userId) })
      toast.success('Cart cleared')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear cart')
    }
  })
}

// =====================================================
// Mutation: useLockCart
// =====================================================

export function useLockCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ cartId, duration = 5 }: { cartId: string; duration?: number }) => {
      const result = await lockCartForCheckout(cartId, duration)
      if (!result.success) {
        throw new Error(result.error || 'Failed to lock cart')
      }
      return result.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lockStatus(variables.cartId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to lock cart')
    }
  })
}

// =====================================================
// Mutation: useUnlockCart
// =====================================================

export function useUnlockCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cartId: string) => {
      const result = await unlockCart(cartId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to unlock cart')
      }
      return result.data
    },
    onSuccess: (_, cartId) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lockStatus(cartId) })
      toast.success('Cart unlocked')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock cart')
    }
  })
}

// =====================================================
// Helper: Empty Summary
// =====================================================

function getEmptySummary(): CartSummary {
  return {
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
  }
}

