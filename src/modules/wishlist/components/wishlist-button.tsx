"use client"

import { useState } from "react"
import { Heart, LoaderCircle } from "lucide-react"
import { useWishlist } from "@/lib/hooks"
import { Product } from "@/lib/types/domain"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  product: Product
  variant?: "icon" | "button"
  size?: "sm" | "md" | "lg"
  className?: string
  showLabel?: boolean
}

export default function WishlistButton({
  product,
  variant = "icon",
  size = "md",
  className = "",
  showLabel = false
}: WishlistButtonProps) {
  const { toggleItem, isInWishlist } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)

  const variantId = product.variants?.[0]?.id || ""
  const price = product.variants?.[0]?.calculated_price?.calculated_amount ||
    product.variants?.[0]?.price || 0
  const isWishlisted = isInWishlist(variantId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantId) {
      console.warn('No variant ID available for wishlist')
      return
    }

    setIsLoading(true)
    try {
      await toggleItem(
        variantId,
        product.id!,
        product.title || "",
        product.thumbnail || null,
        price
      )
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading || !variantId}
        className={cn(
          sizeClasses[size],
          "rounded-full bg-white/90 backdrop-blur-sm",
          "flex items-center justify-center",
          "hover:bg-white transition-all",
          "shadow-md hover:shadow-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95",
          "touch-manipulation", // Better mobile touch response
          className
        )}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isLoading ? (
          <LoaderCircle className={cn(iconSizes[size], "animate-spin text-gray-600")} />
        ) : (
          <Heart
            className={cn(
              iconSizes[size],
              "transition-all",
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            )}
          />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !variantId}
      className={cn(
        "flex items-center justify-center gap-2",
        "px-4 py-2 rounded-lg",
        "border-2 transition-all",
        "font-medium text-sm",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-95",
        "touch-manipulation",
        isWishlisted
          ? "border-red-500 text-red-500 bg-red-50 hover:bg-red-100"
          : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50",
        className
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="w-5 h-5 animate-spin" />
          {showLabel && (isWishlisted ? "Removing..." : "Adding...")}
        </>
      ) : (
        <>
          <Heart
            className={cn("w-5 h-5", isWishlisted && "fill-red-500")}
          />
          {showLabel && (isWishlisted ? "Saved" : "Save")}
        </>
      )}
    </button>
  )
}
