"use client"

import { useState, useEffect, useCallback } from "react"
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

export function useWishlist() {
  const { user } = useUser()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await fetch('/api/wishlist')
      const data = await response.json()

      if (data.success) {
        setItems(data.items || [])
        setCount(data.count || 0)
      } else {
        console.error('fetch failed:', data.error)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error('Failed to load wishlist')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist, user])

  const addItem = async (
    variantId: string,
    productId: string,
    title: string,
    thumbnail: string | null,
    price: number
  ) => {

    // Optimistic update with flat structure
    const optimisticItem: WishlistItem = {
      id: `temp_${Date.now()}`,
      variant_id: variantId,
      product_id: productId,
      quantity: 1,
      product_title: title,
      product_thumbnail: thumbnail,
      product_handle: '',
      variant_title: '',
      price: price
    }

    const previousItems = [...items]
    const previousCount = count

    setItems([optimisticItem, ...items])
    setCount(count + 1)

    try {
      const response = await fetch('/api/wishlist/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
          quantity: 1,
          // Product snapshot data
          product_title: title,
          product_thumbnail: thumbnail,
          product_handle: '',
          variant_title: '',
          price: price
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to add item')
      }

      // Refresh to get accurate data (replace temp ID with real ID)
      await fetchWishlist()
      toast.success('Added to wishlist')

      return { items: data.items, count: data.count }
    } catch (error) {
      // Rollback on error
      console.error('add failed, rolling back:', error)
      setItems(previousItems)
      setCount(previousCount)
      toast.error('Failed to add to wishlist')
      throw error
    }
  }

  const removeItem = async (variantId: string) => {
    const itemToRemove = items.find(item => item.variant_id === variantId)
    if (!itemToRemove) {
      return
    }

    // Optimistic update
    const previousItems = [...items]
    const previousCount = count

    setItems(items.filter(item => item.variant_id !== variantId))
    setCount(count - 1)

    try {
      // If it's a temp item, we can't delete it from server yet, but checking for 'temp_' prefix is risky if ID format changes.
      // However, fetchWishlist replaces temp IDs with real ones, so usually this is fine.
      const response = await fetch(`/api/wishlist/items/${itemToRemove.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to remove item')
      }

      toast.success('Removed from wishlist')
      return { items: data.items, count: data.count }
    } catch (error) {
      // Rollback on error
      console.error('delete failed, rolling back:', error)
      setItems(previousItems)
      setCount(previousCount)
      toast.error('Failed to remove from wishlist')
      throw error
    }
  }

  const isInWishlist = (variantId: string) => {
    return items.some(item => item.variant_id === variantId)
  }

  const toggleItem = async (
    variantId: string,
    productId: string,
    title: string,
    thumbnail: string | null,
    price: number
  ) => {
    if (isInWishlist(variantId)) {
      return await removeItem(variantId)
    } else {
      return await addItem(variantId, productId, title, thumbnail, price)
    }
  }

  const mergeGuestWishlist = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/wishlist/merge', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        await fetchWishlist()
        if (data.count > 0) {
          toast.success(`Merged ${data.count} items from your guest wishlist`)
        }
      }
    } catch (error) {
      console.error('Error merging wishlist:', error)
    }
  }

  const clearWishlist = async () => {
    const previousItems = [...items]
    const previousCount = count

    setItems([])
    setCount(0)

    try {
      const response = await fetch('/api/wishlist/clear', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to clear wishlist')
      }

      toast.success('Wishlist cleared')
    } catch (error) {
      setItems(previousItems)
      setCount(previousCount)
      console.error('Error clearing wishlist:', error)
      toast.error('Failed to clear wishlist')
      throw error
    }
  }

  // Auto-merge on login
  useEffect(() => {
    if (user) {
      mergeGuestWishlist()
    }
  }, [user?.id])

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
    refresh: fetchWishlist,
  }
}
