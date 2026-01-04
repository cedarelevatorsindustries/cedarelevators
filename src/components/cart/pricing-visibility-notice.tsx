/**
 * Pricing Visibility Notice
 * Shows notice when user can't see prices
 */

'use client'

import { Lock, Info } from 'lucide-react'
import Link from 'next/link'
import { UserType } from '@/types/cart.types'

interface PricingVisibilityNoticeProps {
  userType: UserType
  variant?: 'inline' | 'banner'
}

export function PricingVisibilityNotice({ 
  userType, 
  variant = 'inline' 
}: PricingVisibilityNoticeProps) {
  if (userType === 'individual' || userType === 'business_verified') {
    return null // These user types can see prices
  }

  if (variant === 'banner') {
    return (
      <div 
        className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6"
        data-testid="pricing-notice-banner"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              {userType === 'guest' ? 'Sign in to view pricing' : 'Verify your business to view pricing'}
            </h3>
            <p className="text-sm text-blue-700">
              {userType === 'guest' ? (
                <>
                  Create an account to see product prices and request quotes.{' '}
                  <Link href="/sign-in" className="underline font-medium">
                    Sign in now
                  </Link>
                </>
              ) : (
                <>
                  Complete business verification to unlock pricing and checkout.{' '}
                  <Link href="/profile/verification" className="underline font-medium">
                    Verify now
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Inline variant
  return (
    <div 
      className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md"
      data-testid="pricing-notice-inline"
    >
      <Lock className="w-4 h-4" />
      <span>
        {userType === 'guest' ? (
          <>
            <Link href="/sign-in" className="text-orange-600 hover:underline font-medium">
              Sign in
            </Link>{' '}
            to view pricing
          </>
        ) : (
          <>
            <Link href="/profile/verification" className="text-orange-600 hover:underline font-medium">
              Verify your business
            </Link>{' '}
            to view pricing
          </>
        )}
      </span>
    </div>
  )
}

