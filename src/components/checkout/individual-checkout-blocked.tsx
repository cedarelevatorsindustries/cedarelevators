/**
 * Individual User Checkout Blocked Screen
 * Directs individual users to request quote
 */

'use client'

import { Info, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function IndividualCheckoutBlocked() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12" data-testid="individual-checkout-blocked">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Info className="w-10 h-10 text-blue-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Checkout Not Available
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Individual accounts can request quotes for products. Our team will provide a customized quote with pricing and delivery details.
      </p>
      
      <Link href="/request-quote?source=checkout">
        <Button size="lg">
          <FileText className="w-5 h-5 mr-2" />
          Request Quote Instead
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-3">Want to checkout directly?</h3>
        <p className="text-gray-700 mb-4">
          Upgrade to a business account and get verified to unlock:
        </p>
        <ul className="space-y-2 text-sm text-gray-700 mb-6">
          <li>✓ Direct checkout</li>
          <li>✓ Business pricing and bulk discounts</li>
          <li>✓ Credit terms and invoicing</li>
          <li>✓ Priority support</li>
        </ul>
        <Link href="/business-signup">
          <Button variant="outline" className="w-full">
            Upgrade to Business Account
          </Button>
        </Link>
      </div>
    </div>
  )
}

