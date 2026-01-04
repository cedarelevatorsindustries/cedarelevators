"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/hooks"
import Link from "next/link"

interface CartCountBadgeProps {
  onClick?: () => void
  className?: string
}

export default function CartCountBadge({ onClick, className = "" }: CartCountBadgeProps) {
  const { itemCount, isLoading } = useCart()

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  const badgeContent = (
    <>
      <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600 transition-colors" />
      {!isLoading && itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={handleClick}
        className={`relative inline-flex items-center justify-center ${className}`}
      >
        {badgeContent}
      </button>
    )
  }

  return (
    <Link
      href="/cart"
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      {badgeContent}
    </Link>
  )
}

