"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/auth/client" // Assuming this exists or is Clerk wrapper
import { Cart } from "@/lib/types/domain"
import { getCart, addToCart, updateLineItem, removeLineItem } from "@/lib/actions/cart"
import { toast } from "sonner"

export function useCart() {
  const { user } = useUser()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCart = async () => {
    try {
      const data = await getCart()
      setCart(data)
    } catch (error) {
      console.error("Error refreshing cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [user])

  const addItem = async (variantId: string, quantity: number = 1) => {
    try {
      setIsLoading(true)
      const updatedCart = await addToCart(variantId, quantity)
      setCart(updatedCart)
      toast.success("Item added to cart")
      return updatedCart
    } catch (error) {
      console.error("Error adding item:", error)
      toast.error("Failed to add item")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (lineId: string, quantity: number) => {
    try {
      setIsLoading(true)
      const updatedCart = await updateLineItem(lineId, quantity)
      setCart(updatedCart)
      return updatedCart
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast.error("Failed to update quantity")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (lineId: string) => {
    try {
      setIsLoading(true)
      const updatedCart = await removeLineItem(lineId)
      setCart(updatedCart)
      toast.success("Item removed")
      return updatedCart
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Failed to remove item")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = () => {
    // TODO: Implement clear cart action
    setCart(null)
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
    refresh: refreshCart,
  }
}
