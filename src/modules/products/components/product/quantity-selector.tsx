"use client"

import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 999,
  disabled = false,
  size = "md"
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min
    const clampedValue = Math.max(min, Math.min(max, value))
    onQuantityChange(clampedValue)
  }

  const sizeClasses = {
    sm: {
      button: "w-8 h-8",
      input: "w-16 h-8 text-sm",
      icon: "w-3 h-3"
    },
    md: {
      button: "w-10 h-10",
      input: "w-20 h-10 text-base",
      icon: "w-4 h-4"
    },
    lg: {
      button: "w-12 h-12",
      input: "w-24 h-12 text-lg",
      icon: "w-5 h-5"
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        className={`
          ${classes.button}
          rounded-lg border-2 border-gray-300 
          flex items-center justify-center 
          hover:bg-gray-50 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <Minus className={classes.icon} />
      </button>
      
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className={`
          ${classes.input}
          text-center border-2 border-gray-300 rounded-lg 
          font-semibold
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        `}
      />
      
      <button
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        className={`
          ${classes.button}
          rounded-lg border-2 border-gray-300 
          flex items-center justify-center 
          hover:bg-gray-50 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <Plus className={classes.icon} />
      </button>
    </div>
  )
}

