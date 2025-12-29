"use client"

import { ShoppingCart, LoaderCircle } from "lucide-react"
import { useState } from "react"

interface AddToCartButtonProps {
  productId: string
  quantity: number
  disabled?: boolean
  onAddToCart?: (productId: string, quantity: number) => void | Promise<void>
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function AddToCartButton({
  productId,
  quantity,
  disabled = false,
  onAddToCart,
  className = "",
  size = "md"
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-3.5 px-8 text-lg"
  }

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      await onAddToCart?.(productId, quantity)
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        w-full bg-blue-600 text-white rounded-lg font-semibold 
        hover:bg-blue-700 transition-colors 
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="w-5 h-5 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </>
      )}
    </button>
  )
}
