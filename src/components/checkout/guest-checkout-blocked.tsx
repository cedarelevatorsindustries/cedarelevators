/**
 * Guest Checkout Blocked Screen
 * Prompts guest users to sign in
 */

'use client'

import { Lock, UserPlus, LogIn } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function GuestCheckoutBlocked() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12" data-testid="guest-checkout-blocked">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-10 h-10 text-orange-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Sign In Required
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Please sign in or create an account to proceed with checkout.
      </p>
      
      <div className="flex gap-4 justify-center mb-8">
        <Link href="/sign-in?redirect=/checkout">
          <Button size="lg">
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up?redirect=/checkout">
          <Button size="lg" variant="outline">
            <UserPlus className="w-5 h-5 mr-2" />
            Create Account
          </Button>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
        <h3 className="font-semibold text-blue-900 mb-2">Why create an account?</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>✓ Save your cart across devices</li>
          <li>✓ Track your orders and quotes</li>
          <li>✓ Faster checkout next time</li>
          <li>✓ Access to business pricing (with verification)</li>
        </ul>
      </div>
    </div>
  )
}
