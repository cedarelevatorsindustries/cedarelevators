"use client"

import { useState } from "react"
import { Heart, LoaderCircle } from "lucide-react"
import { useWishlist } from "@/lib/hooks"
import { Product, ProductCategory, Order } from "@/lib/types/domain"

interface WishlistButtonProps {
  product: Product
  variant?: "icon" | "button"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function WishlistButton({
  product,
  variant = "icon",
  size = "md",
  className = ""
}: WishlistButtonProps) {
  const { toggleItem, isInWishlist } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)

  const variantId = product.variants?.[0]?.id || ""
  const price = product.variants?.[0]?.calculated_price?.calculated_amount || 0
  const isWishlisted = isInWishlist(variantId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantId) return

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
        disabled={isLoading}
        className={`
          ${sizeClasses[size]}
          rounded-full bg-white/90 backdrop-blur-sm
          flex items-center justify-center
          hover:bg-white transition-all
          shadow-md hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isLoading ? (
          <LoaderCircle className={`${iconSizes[size]} animate-spin text-gray-600`} />
        ) : (
          <Heart
            className={`${iconSizes[size]} transition-all ${isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
              }`}
          />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2
        px-4 py-2 rounded-lg
        border-2 transition-all
        font-medium text-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isWishlisted
          ? "border-red-500 text-red-500 bg-red-50"
          : "border-gray-300 text-gray-700 hover:border-gray-400"
        }
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="w-5 h-5 animate-spin" />
          {isWishlisted ? "Removing..." : "Adding..."}
        </>
      ) : (
        <>
          <Heart
            className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`}
          />
          {isWishlisted ? "Saved" : "Save"}
        </>
      )}
    </button>
  )
}

