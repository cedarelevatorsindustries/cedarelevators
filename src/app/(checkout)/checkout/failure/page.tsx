/**
 * Checkout Failure Page
 * Handles payment failures with retry options
 */

'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, RefreshCcw, MessageCircle, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutFailurePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Failure Banner */}
        <Card className="p-8 mb-8 text-center" data-testid="payment-failure-banner">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600">
            We couldn't process your payment. Don't worry, you can try again.
          </p>
        </Card>

        {/* Common Reasons */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Common Reasons for Failure</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Insufficient balance in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Payment timeout or network issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Incorrect payment details or OTP</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Bank server temporarily unavailable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Transaction limit exceeded</span>
            </li>
          </ul>
        </Card>

        {/* What to do next */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">What would you like to do?</h2>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/checkout')}
              className="w-full justify-start"
              size="lg"
              data-testid="retry-payment-btn"
            >
              <RefreshCcw className="w-5 h-5 mr-3" />
              <div className="text-left flex-1">
                <p className="font-semibold">Retry Payment</p>
                <p className="text-xs opacity-80">Try paying again with the same or different method</p>
              </div>
            </Button>

            <Link href="/cart" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <ShoppingCart className="w-5 h-5 mr-3" />
                <div className="text-left flex-1">
                  <p className="font-semibold">Return to Cart</p>
                  <p className="text-xs opacity-80">Review your cart items before trying again</p>
                </div>
              </Button>
            </Link>

            <Link href="/request-quote?source=checkout-failure" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <MessageCircle className="w-5 h-5 mr-3" />
                <div className="text-left flex-1">
                  <p className="font-semibold">Request a Quote</p>
                  <p className="text-xs opacity-80">Get a custom quote and pay later</p>
                </div>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">Need Assistance?</h3>
          <p className="text-sm text-blue-700 mb-4">
            If you're facing repeated payment failures or have questions, our support team is ready to help.
          </p>
          <div className="flex gap-3">
            <Link href="/contact" className="flex-1">
              <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                Contact Support
              </Button>
            </Link>
            <a
              href="https://wa.me/919876543210?text=Hi, I need help with a failed payment"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700">
                WhatsApp Us
              </Button>
            </a>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
