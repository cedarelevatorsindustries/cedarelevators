'use client'

import React from 'react'
import { Minus, Plus } from 'lucide-react'

interface QuantityControlProps {
  value: number
  onChange: (nextQty: number) => void
  min?: number
  max?: number
  disabled?: boolean
  itemLabel?: string
  inputId?: string
}

export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 10000,
  disabled = false,
  itemLabel = 'item',
  inputId,
}: QuantityControlProps) {
  const safeVal = Number.isFinite(value) ? Math.max(min, Math.min(max, Math.trunc(value))) : min

  const decrement = () => {
    if (safeVal > min) onChange(safeVal - 1)
  }

  const increment = () => {
    if (safeVal < max) onChange(safeVal + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      onChange(min)
      return
    }
    const parsed = parseInt(raw, 10)
    if (!Number.isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)))
    }
  }

  return (
    <div
      className="inline-flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-colors"
      role="group"
      aria-label={`Quantity for ${itemLabel}`}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || safeVal <= min}
        aria-label={`Decrease quantity for ${itemLabel}`}
        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={safeVal}
        disabled={disabled}
        onChange={handleInputChange}
        aria-label={`Quantity for ${itemLabel}`}
        className="w-12 h-9 text-center text-sm text-gray-900 tabular-nums bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={increment}
        disabled={disabled || safeVal >= max}
        aria-label={`Increase quantity for ${itemLabel}`}
        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l border-gray-200"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
