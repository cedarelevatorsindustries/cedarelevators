"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/auth/client" // Assuming this exists or is Clerk wrapper
import { Cart } from "@/lib/types/domain"
import {
  getCart,
  addToCart,
  updateLineItem,
  removeLineItem,
  clearCart as clearCartAction
} from "@/lib/actions/cart"
import { toast } from "sonner"
import { logger } from "@/lib/services/logger"

export function useCart() {
  const { user } = useUser()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCart = async () => {
    try {
      const data = await getCart()
      setCart(data)
    } catch (error) {
      logger.error("Error refreshing cart", error)
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
      logger.error("Error adding item", error)
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
      logger.error("Error updating quantity", error)
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
      logger.error("Error removing item", error)
      toast.error("Failed to remove item")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setIsLoading(true)
      const updatedCart = await clearCartAction()
      setCart(updatedCart)
      toast.success("Cart cleared")
    } catch (error) {
      logger.error("Error clearing cart", error)
      toast.error("Failed to clear cart")
    } finally {
      setIsLoading(false)
    }
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

