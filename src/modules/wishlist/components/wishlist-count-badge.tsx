"use client"

import { Heart } from "lucide-react"
import { useWishlist } from "@/lib/hooks"
import Link from "next/link"

interface WishlistCountBadgeProps {
  className?: string
}

export default function WishlistCountBadge({ className = "" }: WishlistCountBadgeProps) {
  const { count, isLoading } = useWishlist()

  return (
    <Link
      href="/wishlist"
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <Heart className="w-6 h-6 text-gray-700 hover:text-red-500 transition-colors" />
      {!isLoading && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}

