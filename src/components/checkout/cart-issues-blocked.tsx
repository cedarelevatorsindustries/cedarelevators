/**
 * Cart Issues Blocked Screen
 * Shows when cart has stock or availability issues
 */

'use client'

import { AlertTriangle, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CartIssuesBlockedProps {
  issues?: {
    outOfStock?: string[]
    unavailable?: string[]
    priceChanged?: string[]
  }
}

export function CartIssuesBlocked({ issues }: CartIssuesBlockedProps) {
  const hasOutOfStock = issues?.outOfStock && issues.outOfStock.length > 0
  const hasUnavailable = issues?.unavailable && issues.unavailable.length > 0
  const hasPriceChanged = issues?.priceChanged && issues.priceChanged.length > 0

  return (
    <div className="max-w-2xl mx-auto text-center py-12" data-testid="cart-issues-blocked">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Cannot Proceed to Checkout
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Some items in your cart have issues that need to be resolved before checkout.
      </p>

      <div className="mb-8 space-y-4 text-left">
        {hasOutOfStock && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Out of Stock
            </h3>
            <p className="text-sm text-red-700">
              The following items are currently out of stock:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-red-700">
              {issues.outOfStock.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {hasUnavailable && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Unavailable Products
            </h3>
            <p className="text-sm text-amber-700">
              The following items are no longer available:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-700">
              {issues.unavailable.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {hasPriceChanged && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Price Changes
            </h3>
            <p className="text-sm text-blue-700">
              Prices have been updated for the following items:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              {issues.priceChanged.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Link href="/cart">
        <Button size="lg" data-testid="review-cart-button">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Review Cart
        </Button>
      </Link>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-3">What you can do:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Remove unavailable or out of stock items</li>
          <li>✓ Update quantities if needed</li>
          <li>✓ Review updated prices</li>
          <li>✓ Or request a quote with alternative products</li>
        </ul>
        <Link href="/request-quote?source=cart-issues" className="mt-4 inline-block">
          <Button variant="outline" className="w-full">
            Request Quote Instead
          </Button>
        </Link>
      </div>
    </div>
  )
}
