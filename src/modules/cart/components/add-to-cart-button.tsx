"use client"

import { useState } from "react"
import { ShoppingCart, Loader2, Check } from "lucide-react"
import { useCart } from "@/lib/hooks"

interface AddToCartButtonProps {
  variantId: string
  quantity?: number
  disabled?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
  onSuccess?: () => void
}

export default function AddToCartButton({
  variantId,
  quantity = 1,
  disabled = false,
  className = "",
  size = "md",
  onSuccess
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-3.5 px-8 text-lg"
  }

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      await addItem(variantId, quantity)
      setShowSuccess(true)
      onSuccess?.()
      
      // Reset success state after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000)
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
          <Loader2 className="w-5 h-5 animate-spin" />
          Adding...
        </>
      ) : showSuccess ? (
        <>
          <Check className="w-5 h-5" />
          Added!
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
