"use client"

import { useState, useEffect } from 'react'
import { X, Gift, ArrowRight } from 'lucide-react'

interface ExitIntentPopupProps {
  discountCode?: string
  discountPercent?: number
  onClose: () => void
  onApplyDiscount: (code: string) => void
}

export default function ExitIntentPopup({
  discountCode = 'STAY5',
  discountPercent = 5,
  onClose,
  onApplyDiscount,
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Check if already shown in this session
    if (sessionStorage.getItem('exitIntentShown')) {
      setHasShown(true)
      return
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem('exitIntentShown', 'true')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [hasShown])

  const handleApply = () => {
    onApplyDiscount(discountCode)
    setIsVisible(false)
    onClose()
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Wait! Don't Leave Yet</h2>
          <p className="text-orange-100">We have a special offer for you</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Complete your order now and get an exclusive discount!
            </p>
            <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-4">
              <p className="text-sm text-orange-600 mb-1">Use code</p>
              <p className="text-3xl font-bold text-orange-600 font-mono">{discountCode}</p>
              <p className="text-sm text-orange-600 mt-1">for {discountPercent}% extra off</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleApply}
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold
                hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              Apply & Continue
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              No thanks, I'll pay full price
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
