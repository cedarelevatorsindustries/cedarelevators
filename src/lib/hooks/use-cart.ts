"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/auth/client"
import type { Cart } from "@/types/cart.types"
import {
  getUserActiveCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
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
      const response = await getUserActiveCart()
      if (response.success && response.data) {
        setCart(response.data)
      }
    } catch (error) {
      logger.error("Error refreshing cart", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [user])

  const addItem = async (productId: string, variantId?: string, quantity: number = 1) => {
    try {
      setIsLoading(true)
      const response = await addItemToCart({
        productId,
        variantId,
        quantity
      })
      if (response.success) {
        await refreshCart()
        toast.success("Item added to cart")
      } else {
        toast.error(response.error || "Failed to add item")
      }
      return response
    } catch (error) {
      logger.error("Error adding item", error)
      toast.error("Failed to add item")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setIsLoading(true)
      const response = await updateCartItemQuantity({
        cartItemId,
        quantity
      })
      if (response.success) {
        await refreshCart()
      } else {
        toast.error(response.error || "Failed to update quantity")
      }
      return response

    } catch (error) {
      logger.error("Error updating quantity", error)
      toast.error("Failed to update quantity")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (cartItemId: string) => {
    try {
      setIsLoading(true)
      const response = await removeCartItem(cartItemId)
      if (response.success) {
        await refreshCart()
        toast.success("Item removed")
      } else {
        toast.error(response.error || "Failed to remove item")
      }
      return response
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
      if (cart?.id) {
        const response = await clearCartAction(cart.id)
        if (response.success) {
          await refreshCart()
          toast.success("Cart cleared")
        } else {
          toast.error(response.error || "Failed to clear cart")
        }
      }
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
