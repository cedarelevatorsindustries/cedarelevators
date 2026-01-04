"use client"

import { useState } from 'react'
import { Tag, X, Check, LoaderCircle } from 'lucide-react'

interface CouponCodeInputProps {
  appliedCode?: string
  onApply: (code: string) => Promise<boolean>
  onRemove: () => void
  discount?: number
  showPrices: boolean
}

export default function CouponCodeInput({
  appliedCode,
  onApply,
  onRemove,
  discount = 0,
  showPrices,
}: CouponCodeInputProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPrice = (amount: number) => {
    if (!showPrices) return '₹X,XXX'
    return `₹${(amount / 100).toLocaleString('en-IN')}`
  }

  const handleApply = async () => {
    if (!code.trim()) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const success = await onApply(code.trim().toUpperCase())
      if (!success) {
        setError('Invalid or expired coupon code')
      } else {
        setCode('')
      }
    } catch {
      setError('Failed to apply coupon')
    } finally {
      setIsLoading(false)
    }
  }

  if (appliedCode) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">{appliedCode}</p>
              <p className="text-sm text-green-600">
                Saving {formatPrice(discount)}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 text-green-600 hover:bg-green-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="Enter coupon code"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              uppercase placeholder:normal-case"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim() || isLoading}
          className="px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm
            hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2"
        >
          {isLoading ? (
            <LoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

