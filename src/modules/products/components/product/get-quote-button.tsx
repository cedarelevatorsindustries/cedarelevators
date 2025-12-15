"use client"

import { MessageSquare, Loader2 } from "lucide-react"
import { useState } from "react"

interface GetQuoteButtonProps {
  productId: string
  quantity?: number
  disabled?: boolean
  onRequestQuote?: (productId: string, quantity?: number) => void | Promise<void>
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "secondary"
}

export default function GetQuoteButton({
  productId,
  quantity,
  disabled = false,
  onRequestQuote,
  className = "",
  size = "md",
  variant = "primary"
}: GetQuoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-3.5 px-8 text-lg"
  }

  const variantClasses = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
  }

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      await onRequestQuote?.(productId, quantity)
    } catch (error) {
      console.error("Error requesting quote:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        w-full rounded-lg font-semibold 
        transition-colors 
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Requesting...
        </>
      ) : (
        <>
          <MessageSquare className="w-5 h-5" />
          {variant === "primary" ? "Request Quote" : "Get Bulk Quote"}
        </>
      )}
    </button>
  )
}
