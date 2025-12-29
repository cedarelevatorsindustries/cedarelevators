"use client"

import { CircleCheck, Package, MessageCircle, Share2, ArrowRight, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

interface ThankYouSectionProps {
  orderId: string
  orderType: 'order' | 'quote'
  email: string
  estimatedDelivery?: string
  isGuest: boolean
  onCreateAccount?: () => void
}

export default function ThankYouSection({
  orderId,
  orderType,
  email,
  estimatedDelivery,
  isGuest,
  onCreateAccount,
}: ThankYouSectionProps) {
  // Confetti effect on mount (optional - graceful degradation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#f97316'],
        })
      }).catch(() => {
        // Confetti not available, gracefully degrade
      })
    }
  }, [])

  const isOrder = orderType === 'order'
  const title = isOrder ? 'Order Placed Successfully!' : 'Quote Request Submitted!'
  const subtitle = isOrder 
    ? 'Thank you for your order. We\'ll start processing it right away.'
    : 'Thank you for your interest. Our team will contact you within 24 hours.'

  const whatsappMessage = isOrder
    ? `Hi, I just placed order ${orderId} on Cedar Elevators. Can you confirm the delivery timeline?`
    : `Hi, I just submitted a quote request (${orderId}) on Cedar Elevators. Looking forward to your response.`

  const shareText = isOrder
    ? `Just ordered premium elevator components from Cedar Elevators! 🛗 Order: ${orderId}`
    : `Requested a quote for elevator components from Cedar Elevators! 🛗`

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full max-w-lg">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CircleCheck className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 mb-6">
            {subtitle}
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{isOrder ? 'Order' : 'Quote'} Number</span>
                <span className="font-mono font-bold text-gray-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation sent to</span>
                <span className="font-medium text-gray-900">{email}</span>
              </div>
              {isOrder && estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Delivery</span>
                  <span className="font-medium text-green-600">{estimatedDelivery}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span>Confirmation sent via WhatsApp & Email</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isOrder && (
              <Link
                href={`/dashboard/orders/${orderId}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Package className="w-5 h-5" />
                Track Order
              </Link>
            )}

            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ text: shareText, url: window.location.href })
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Guest Account Creation CTA */}
          {isGuest && (
            <div className="mt-6 pt-6 border-t">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-blue-900">Create an Account</span>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  Track orders, save addresses, and get exclusive dealer pricing.
                </p>
                <Link
                  href={`/sign-up?email=${encodeURIComponent(email)}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Continue Shopping */}
        <div className="mt-6 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
