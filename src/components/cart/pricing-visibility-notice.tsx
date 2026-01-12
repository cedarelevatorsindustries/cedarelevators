/**
 * Pricing Visibility Notice
 * Shows notice when user can't see prices
 */

'use client'

import { Lock, Info, Clock } from 'lucide-react'
import Link from 'next/link'
import { UserType } from '@/types/cart.types'
import { VerificationStatus } from '@/lib/hooks/useUserPricing'

interface PricingVisibilityNoticeProps {
  userType: UserType
  variant?: 'inline' | 'banner'
  verificationStatus?: VerificationStatus
}

export function PricingVisibilityNotice({
  userType,
  variant = 'inline',
  verificationStatus
}: PricingVisibilityNoticeProps) {
  // Verified business users can see prices - hide notice
  if (userType === 'individual' || userType === 'business_verified' || verificationStatus === 'approved') {
    return null
  }

  // Check if verification is pending
  const isPending = verificationStatus === 'pending'

  if (variant === 'banner') {
    return (
      <div
        className={`${isPending ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-500'} p-4 mb-6`}
        data-testid="pricing-notice-banner"
      >
        <div className="flex items-start gap-3">
          {isPending ? (
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              {userType === 'guest'
                ? 'Sign in to view pricing'
                : isPending
                  ? 'Verification Under Review'
                  : 'Verify your business to view pricing'}
            </h3>
            <p className="text-sm text-blue-700">
              {userType === 'guest' ? (
                <>
                  Create an account to see product prices and request quotes.{' '}
                  <Link href="/sign-in" className="underline font-medium">
                    Sign in now
                  </Link>
                </>
              ) : isPending ? (
                <>
                  Your business verification is being reviewed. You&apos;ll be notified once approved.
                </>
              ) : (
                <>
                  Complete business verification to unlock pricing and checkout.{' '}
                  <Link href="/profile/business/verification" className="underline font-medium">
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
      {isPending ? <Clock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      <span>
        {userType === 'guest' ? (
          <>
            <Link href="/sign-in" className="text-orange-600 hover:underline font-medium">
              Sign in
            </Link>{' '}
            to view pricing
          </>
        ) : isPending ? (
          <span className="text-blue-600">⏳ Verification Under Review</span>
        ) : (
          <>
            <Link href="/profile/business/verification" className="text-orange-600 hover:underline font-medium">
              Verify your business
            </Link>{' '}
            to view pricing
          </>
        )}
      </span>
    </div>
  )
}
