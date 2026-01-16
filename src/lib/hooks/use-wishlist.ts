"use client"

import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/lib/auth/client"
import { toast } from "sonner"

export interface WishlistItem {
  id: string
  variant_id: string
  product_id: string
  quantity: number
  notes?: string
  // Product snapshot fields (flat structure)
  product_title?: string
  product_thumbnail?: string | null
  product_handle?: string
  variant_title?: string
  price?: number
  // Legacy nested structure (for backwards compatibility)
  products?: {
    id: string
    title: string
    thumbnail: string | null
    handle: string
    description?: string
  }
  variants?: {
    id: string
    title: string
    price: number
    calculated_price?: {
      calculated_amount: number
    }
  }
}

interface WishlistData {
  items: WishlistItem[]
  count: number
}

// Fetch function - only called ONCE per cache key
async function fetchWishlist(): Promise<WishlistData> {
  const response = await fetch('/api/wishlist')
  const data = await response.json()

  if (data.success) {
    return { items: data.items || [], count: data.count || 0 }
  }

  console.error('Wishlist fetch failed:', data.error)
  return { items: [], count: 0 }
}

// Query key factory
const wishlistKeys = {
  all: ['wishlist'] as const,
}

export function useWishlist() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Single query - React Query deduplicates across all components
  const { data, isLoading } = useQuery({
    queryKey: wishlistKeys.all,
    queryFn: fetchWishlist,
    staleTime: 1000 * 60 * 2,  // 2 minutes - reduces refetching
    gcTime: 1000 * 60 * 10,    // 10 minutes - keep in cache
  })

  const items = data?.items || []
  const count = data?.count || 0

  // Add item mutation
  const addMutation = useMutation({
    mutationFn: async ({ variantId, productId, title, thumbnail, price }: {
      variantId: string
      productId: string
      title: string
      thumbnail: string | null
      price: number
    }) => {
      const response = await fetch('/api/wishlist/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
          quantity: 1,
          product_title: title,
          product_thumbnail: thumbnail,
          product_handle: '',
          variant_title: '',
          price: price
        })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to add item')
      return data
    },
    onMutate: async ({ variantId, productId, title, thumbnail, price }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all })

      // Snapshot previous value
      const previous = queryClient.getQueryData<WishlistData>(wishlistKeys.all)

      // Optimistic update
      queryClient.setQueryData<WishlistData>(wishlistKeys.all, (old) => ({
        items: [
          {
            id: `temp_${Date.now()}`,
            variant_id: variantId,
            product_id: productId,
            quantity: 1,
            product_title: title,
            product_thumbnail: thumbnail,
            product_handle: '',
            variant_title: '',
            price: price
          },
          ...(old?.items || [])
        ],
        count: (old?.count || 0) + 1
      }))

      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(wishlistKeys.all, context.previous)
      }
      toast.error('Failed to add to wishlist')
    },
    onSuccess: () => {
      toast.success('Added to wishlist')
      // Refetch to get real ID
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all })
    }
  })

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/wishlist/items/${itemId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to remove item')
      return data
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all })
      const previous = queryClient.getQueryData<WishlistData>(wishlistKeys.all)

      queryClient.setQueryData<WishlistData>(wishlistKeys.all, (old) => ({
        items: (old?.items || []).filter(item => item.id !== itemId),
        count: Math.max((old?.count || 0) - 1, 0)
      }))

      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(wishlistKeys.all, context.previous)
      }
      toast.error('Failed to remove from wishlist')
    },
    onSuccess: () => {
      toast.success('Removed from wishlist')
    }
  })

  // Clear wishlist mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/wishlist/clear', {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to clear wishlist')
      return data
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all })
      const previous = queryClient.getQueryData<WishlistData>(wishlistKeys.all)
      queryClient.setQueryData<WishlistData>(wishlistKeys.all, { items: [], count: 0 })
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(wishlistKeys.all, context.previous)
      }
      toast.error('Failed to clear wishlist')
    },
    onSuccess: () => {
      toast.success('Wishlist cleared')
    }
  })

  // Merge guest wishlist mutation
  const mergeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/wishlist/merge', {
        method: 'POST'
      })
      return response.json()
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: wishlistKeys.all })
        if (data.count > 0) {
          toast.success(`Merged ${data.count} items from your guest wishlist`)
        }
      }
    }
  })

  const addItem = useCallback(
    (variantId: string, productId: string, title: string, thumbnail: string | null, price: number) => {
      return addMutation.mutateAsync({ variantId, productId, title, thumbnail, price })
    },
    [addMutation]
  )

  const removeItem = useCallback(
    (variantId: string) => {
      const item = items.find(i => i.variant_id === variantId)
      if (item) {
        return removeMutation.mutateAsync(item.id)
      }
    },
    [items, removeMutation]
  )

  const isInWishlist = useCallback(
    (variantId: string) => items.some(item => item.variant_id === variantId),
    [items]
  )

  const toggleItem = useCallback(
    async (variantId: string, productId: string, title: string, thumbnail: string | null, price: number) => {
      if (isInWishlist(variantId)) {
        return removeItem(variantId)
      } else {
        return addItem(variantId, productId, title, thumbnail, price)
      }
    },
    [isInWishlist, removeItem, addItem]
  )

  const mergeGuestWishlist = useCallback(() => {
    if (user) {
      mergeMutation.mutate()
    }
  }, [user, mergeMutation])

  const clearWishlist = useCallback(() => {
    return clearMutation.mutateAsync()
  }, [clearMutation])

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: wishlistKeys.all })
  }, [queryClient])

  return {
    items,
    count,
    isLoading,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
    mergeGuestWishlist,
    clearWishlist,
    refresh,
  }
}
