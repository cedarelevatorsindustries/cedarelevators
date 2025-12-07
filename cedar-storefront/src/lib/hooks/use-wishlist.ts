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

export function useWishlist() {
  const { user } = useUser()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchWishlist = async () => {
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
