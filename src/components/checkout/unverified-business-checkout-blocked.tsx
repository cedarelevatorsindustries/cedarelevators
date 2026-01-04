/**
 * Unverified Business Checkout Blocked Screen
 * Prompts unverified business users to complete verification
 */

'use client'

import { Shield, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function UnverifiedBusinessCheckoutBlocked() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12" data-testid="unverified-business-blocked">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield className="w-10 h-10 text-amber-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Business Verification Required
      </h1>
      <p className="text-lg text-gray-600 mb-2">
        Your business account needs to be verified before you can checkout.
      </p>
      <p className="text-gray-600 mb-8">
        Complete the verification process to unlock checkout and business pricing.
      </p>
      
      <Link href="/profile/verification?redirect=/checkout">
        <Button size="lg">
          <Shield className="w-5 h-5 mr-2" />
          Complete Verification
        </Button>
      </Link>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Verification Process
        </h3>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900">1.</span>
            <span>Provide business details (GST, PAN, address)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900">2.</span>
            <span>Upload required documents</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900">3.</span>
            <span>Our team reviews (usually within 24 hours)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900">4.</span>
            <span>Get verified and start ordering!</span>
          </li>
        </ol>
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 text-left">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> You can still request quotes while verification is pending.
            </p>
            <Link href="/request-quote?source=checkout" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
              Request a quote instead →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

