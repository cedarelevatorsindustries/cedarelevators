"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/auth/client"
import { isDemoMode } from "@/lib/data/demo/config"

interface WishlistItem {
  id: string
  variant_id: string
  product_id: string
  title: string
  thumbnail: string | null
  price: number
  quantity: number
}

const WISHLIST_STORAGE_KEY = "demo-wishlist"

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
    // 🚀 Demo Mode: Use localStorage
    if (isDemoMode()) {
      const storedItems = getStoredWishlist()
      setItems(storedItems)
      setCount(storedItems.length)
      setIsLoading(false)
      return
    }

    // Production Mode: Fetch from Medusa
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/wishlist`, {
        credentials: "include",
      })
      const data = await response.json()
      setItems(data.items || [])
      setCount(data.count || 0)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setIsLoading(false)
    }
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
    // 🚀 Demo Mode: Add to localStorage
    if (isDemoMode()) {
      const newItem: WishlistItem = {
        id: `wishlist-${Date.now()}`,
        variant_id: variantId,
        product_id: productId,
        title,
        thumbnail,
        price,
        quantity: 1,
      }
      const existingItems = getStoredWishlist()
      // Check if already exists
      if (existingItems.some(item => item.variant_id === variantId)) {
        return { items: existingItems, count: existingItems.length }
      }
      const updatedItems = [...existingItems, newItem]
      saveWishlist(updatedItems)
      setItems(updatedItems)
      setCount(updatedItems.length)
      return { items: updatedItems, count: updatedItems.length }
    }

    // Production Mode: Add via Medusa
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/wishlist/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: variantId,
          product_id: productId,
          title,
          thumbnail,
          price,
        }),
        credentials: "include",
      })
      const data = await response.json()
      setItems(data.items || [])
      setCount(data.count || 0)
      return data
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
  }

  const removeItem = async (variantId: string) => {
    // 🚀 Demo Mode: Remove from localStorage
    if (isDemoMode()) {
      const existingItems = getStoredWishlist()
      const updatedItems = existingItems.filter(item => item.variant_id !== variantId)
      saveWishlist(updatedItems)
      setItems(updatedItems)
      setCount(updatedItems.length)
      return { items: updatedItems, count: updatedItems.length }
    }

    // Production Mode: Remove via Medusa
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/wishlist/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId }),
        credentials: "include",
      })
      const data = await response.json()
      setItems(data.items || [])
      setCount(data.count || 0)
      return data
    } catch (error) {
      console.error("Error removing from wishlist:", error)
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

  const mergeGuestWishlist = async (sessionId: string) => {
    // 🚀 Demo Mode: No-op (already using localStorage)
    if (isDemoMode()) {
      return { items, count }
    }

    if (!user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/wishlist/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
        credentials: "include",
      })
      const data = await response.json()
      setItems(data.items || [])
      setCount(data.count || 0)
      return data
    } catch (error) {
      console.error("Error merging wishlist:", error)
      throw error
    }
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
    refresh: fetchWishlist,
  }
}
