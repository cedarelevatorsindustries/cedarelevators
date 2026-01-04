"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/auth/client"

interface WishlistItem {
  id: string
  variant_id: string
  product_id: string
  title: string
  thumbnail: string | null
  price: number
  quantity: number
}

const WISHLIST_STORAGE_KEY = "cedar-wishlist"

// Helper functions for localStorage
function getStoredWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveWishlist(items: WishlistItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
}

export function useWishlist() {
  const { user } = useUser()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchWishlist = async () => {
    // Load from localStorage
    const storedItems = getStoredWishlist()
    setItems(storedItems)
    setCount(storedItems.length)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchWishlist()
  }, [user])

  const addItem = async (
    variantId: string,
    productId: string,
    title: string,
    thumbnail: string | null,
    price: number
  ) => {
    const currentItems = getStoredWishlist()

    // Check if item already exists
    if (currentItems.some(item => item.variant_id === variantId)) {
      return { items: currentItems, count: currentItems.length }
    }

    const newItem: WishlistItem = {
      id: `wishlist_${Date.now()}_${variantId}`,
      variant_id: variantId,
      product_id: productId,
      title,
      thumbnail,
      price,
      quantity: 1,
    }

    const updatedItems = [...currentItems, newItem]
    saveWishlist(updatedItems)
    setItems(updatedItems)
    setCount(updatedItems.length)

    return { items: updatedItems, count: updatedItems.length }
  }

  const removeItem = async (variantId: string) => {
    const currentItems = getStoredWishlist()
    const updatedItems = currentItems.filter(item => item.variant_id !== variantId)

    saveWishlist(updatedItems)
    setItems(updatedItems)
    setCount(updatedItems.length)

    return { items: updatedItems, count: updatedItems.length }
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

  const mergeGuestWishlist = async (sessionId: string) => {
    // For localStorage-only implementation, no merging needed
    // Just reload the current wishlist
    await fetchWishlist()
  }

  const clearWishlist = () => {
    saveWishlist([])
    setItems([])
    setCount(0)
  }

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

