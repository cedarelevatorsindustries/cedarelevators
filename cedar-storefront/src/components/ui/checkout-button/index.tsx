"use client"

import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/hooks'
import { ShoppingCart, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface CheckoutButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  showIcon?: boolean
  label?: string
  className?: string
}

export default function CheckoutButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  showIcon = true,
  label = 'Proceed to Checkout',
  className = '',
}: CheckoutButtonProps) {
  const router = useRouter()
  const { itemCount, isLoading } = useCart()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = () => {
    if (itemCount === 0) return
    setIsNavigating(true)
    router.push('/checkout')
  }

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  const isDisabled = itemCount === 0 || isLoading || isNavigating

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyle}
        ${className}
      `}
    >
      {isNavigating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Redirecting...
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="w-5 h-5" />}
          {label}
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  )
}
