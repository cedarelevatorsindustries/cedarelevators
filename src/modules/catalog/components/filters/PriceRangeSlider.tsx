"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PriceRangeSliderProps {
  min: number
  max: number
  currentMin?: number
  currentMax?: number
  onChange: (min: number, max: number) => void
  currency?: string
}

export function PriceRangeSlider({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
  currency = "₹"
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(currentMin || min)
  const [localMax, setLocalMax] = useState(currentMax || max)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setLocalMin(currentMin || min)
    setLocalMax(currentMax || max)
  }, [currentMin, currentMax, min, max])

  const handleSliderChange = (values: number[]) => {
    setLocalMin(values[0])
    setLocalMax(values[1])
    setIsDragging(true)
  }

  const handleSliderCommit = (values: number[]) => {
    setIsDragging(false)
    onChange(values[0], values[1])
  }

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || min
    const clampedValue = Math.max(min, Math.min(value, localMax))
    setLocalMin(clampedValue)
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || max
    const clampedValue = Math.max(localMin, Math.min(value, max))
    setLocalMax(clampedValue)
  }

  const handleInputBlur = () => {
    onChange(localMin, localMax)
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="px-2">
        <Slider
          min={min}
          max={max}
          step={100}
          value={[localMin, localMax]}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price-min" className="text-xs text-gray-600 mb-1">
            Min Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {currency}
            </span>
            <Input
              id="price-min"
              type="number"
              value={localMin}
              onChange={handleMinInputChange}
              onBlur={handleInputBlur}
              min={min}
              max={localMax}
              className="pl-8 text-sm"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="price-max" className="text-xs text-gray-600 mb-1">
            Max Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {currency}
            </span>
            <Input
              id="price-max"
              type="number"
              value={localMax}
              onChange={handleMaxInputChange}
              onBlur={handleInputBlur}
              min={localMin}
              max={max}
              className="pl-8 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatPrice(localMin)}</span>
        <span>{formatPrice(localMax)}</span>
      </div>
    </div>
  )
}

