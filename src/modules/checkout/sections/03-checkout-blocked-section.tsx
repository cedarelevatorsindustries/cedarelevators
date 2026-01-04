"use client"

import { Lock, UserPlus, Building2, ShieldCheck, FileText, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import type { UserCheckoutType } from '../types'

interface CheckoutBlockedSectionProps {
  userType: UserCheckoutType
  onRequestQuote: () => void
  isLoading?: boolean
}

const BLOCKED_CONTENT = {
  guest: {
    icon: Lock,
    title: 'Login to Continue',
    description: 'Please login or create an account to proceed with your purchase.',
    primaryCta: { label: 'Login', href: '/sign-in?redirect=/checkout' },
    secondaryCta: { label: 'Create Account', href: '/sign-up?redirect=/checkout' },
    showQuoteButton: true,
  },
  individual: {
    icon: Building2,
    title: 'Upgrade to Business Account',
    description: 'Individual accounts cannot purchase directly. Upgrade to a business account to unlock dealer pricing and direct ordering.',
    primaryCta: { label: 'Upgrade to Business', href: '/business-signup' },
    secondaryCta: null,
    showQuoteButton: true,
    benefits: [
      'Access wholesale pricing',
      'Bulk order discounts',
      '30-day credit terms',
      'Dedicated account manager',
    ],
  },
  business_unverified: {
    icon: ShieldCheck,
    title: 'Verify Your Business',
    description: 'Your business account is pending verification. Complete verification to unlock purchasing.',
    primaryCta: { label: 'Complete Verification', href: '/dashboard/verification' },
    secondaryCta: null,
    showQuoteButton: true,
    pendingMessage: 'Verification typically takes 24-48 hours after document submission.',
  },
  business_verified: {
    icon: null,
    title: '',
    description: '',
    primaryCta: null,
    secondaryCta: null,
    showQuoteButton: false,
  },
}

export default function CheckoutBlockedSection({ 
  userType, 
  onRequestQuote, 
  isLoading 
}: CheckoutBlockedSectionProps) {
  const content = BLOCKED_CONTENT[userType]
  
  if (!content.icon) return null

  const Icon = content.icon

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-orange-600" />
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {content.title}
          </h1>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            {content.description}
          </p>

          {/* Benefits List (for individual users) */}
          {'benefits' in content && content.benefits && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <p className="font-semibold text-blue-900 mb-3">Business Account Benefits:</p>
              <ul className="space-y-2">
                {content.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-blue-800">
                    <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pending Message (for unverified business) */}
          {'pendingMessage' in content && content.pendingMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-yellow-800 text-sm">
                ⏳ {content.pendingMessage}
              </p>
            </div>
          )}

          {/* Primary CTA */}
          {content.primaryCta && (
            <Link
              href={content.primaryCta.href}
              className="block w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold
                hover:bg-blue-700 transition-colors mb-3"
            >
              {content.primaryCta.label}
            </Link>
          )}

          {/* Secondary CTA */}
          {content.secondaryCta && (
            <Link
              href={content.secondaryCta.href}
              className="block w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold
                hover:border-gray-400 hover:bg-gray-50 transition-colors mb-4"
            >
              {content.secondaryCta.label}
            </Link>
          )}

          {/* Divider */}
          {content.showQuoteButton && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">or</span>
                </div>
              </div>

              {/* Request Quote Button */}
              <button
                onClick={onRequestQuote}
                disabled={isLoading}
                className="w-full py-3 bg-orange-100 text-orange-700 rounded-lg font-semibold
                  hover:bg-orange-200 transition-colors flex items-center justify-center gap-2
                  disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                Request Quote Instead
              </button>
            </>
          )}
        </div>

        {/* WhatsApp Help */}
        <div className="mt-6 text-center">
          <a
            href="https://wa.me/919876543210?text=Hi, I need help with my checkout"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Need help? Chat on WhatsApp
          </a>
        </div>

        {/* Cart Summary Preview (prices hidden) */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Your Cart</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-mono">₹XX,XX,XXX</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span className="font-mono">₹XX,XX,XXX</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            💡 Login as a verified dealer to see actual prices
          </p>
        </div>
      </div>
    </div>
  )
}

