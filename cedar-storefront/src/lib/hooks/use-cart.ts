"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/auth/client"

interface CartItem {
  id: string
  variant_id: string
  product_id: string
  title: string
  thumbnail: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  total: number
  tax_total: number
  shipping_total: number
  discount_total: number
}

const CART_ID_KEY = "cedar_cart_id"
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export function useCart() {
  const { user } = useUser()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get or create cart
  const fetchCart = async () => {
    try {
      let cartId = localStorage.getItem(CART_ID_KEY)

      // Create new cart if none exists
      if (!cartId) {
        const res = await fetch(`${MEDUSA_URL}/store/carts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
        const data = await res.json()
        cartId = data.cart.id
        if (cartId) {
          localStorage.setItem(CART_ID_KEY, cartId)
        }
      }

      // Fetch cart
      const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, {
        credentials: "include",
      })
      const data = await res.json()
      setCart(data.cart)
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [user])

  // Add item to cart
  const addItem = async (variantId: string, quantity: number = 1) => {
    try {
      const cartId = cart?.id || localStorage.getItem(CART_ID_KEY)
      if (!cartId) {
        await fetchCart()
        return
      }

      const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId, quantity }),
        credentials: "include",
      })
      const data = await res.json()
      setCart(data.cart)
      return data
    } catch (error) {
      console.error("Error adding item:", error)
      throw error
    }
  }

  // Update item quantity
  const updateQuantity = async (lineId: string, quantity: number) => {
    try {
      if (!cart?.id) return

      const res = await fetch(`${MEDUSA_URL}/store/carts/${cart.id}/line-items/${lineId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      })
      const data = await res.json()
      setCart(data.cart)
      return data
    } catch (error) {
      console.error("Error updating quantity:", error)
      throw error
    }
  }

  // Remove item from cart
  const removeItem = async (lineId: string) => {
    try {
      if (!cart?.id) return

      const res = await fetch(`${MEDUSA_URL}/store/carts/${cart.id}/line-items/${lineId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      setCart(data.cart)
      return data
    } catch (error) {
      console.error("Error removing item:", error)
      throw error
    }
  }

  // Clear cart
  const clearCart = () => {
    localStorage.removeItem(CART_ID_KEY)
    setCart(null)
    fetchCart()
  }

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return {
    cart,
    items: cart?.items || [],
    itemCount,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refresh: fetchCart,
  }
}
