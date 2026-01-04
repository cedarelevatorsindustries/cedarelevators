/**
 * Blocked Checkout Screen
 * Cedar Elevator Industries
 * 
 * Displays when checkout is blocked for specific user type
 * with appropriate messaging and CTAs
 */

'use client'

import { UserType } from '@/types/cart.types'
import { Lock, ShieldAlert, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BlockedCheckoutScreenProps {
  userType: UserType
  reason: 'guest' | 'individual' | 'unverified' | 'cart_issues'
  itemCount?: number
}

export function BlockedCheckoutScreen({ userType, reason, itemCount = 0 }: BlockedCheckoutScreenProps) {
  const router = useRouter()

  const configs = {
    guest: {
      icon: Lock,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      title: 'Sign In to Continue',
      message: 'Please sign in to proceed with checkout. Your cart will be saved automatically.',
      primaryAction: {
        text: 'Sign In',
        href: '/sign-in?redirect=/checkout'
      },
      secondaryAction: {
        text: 'Create Account',
        href: '/sign-up?redirect=/checkout'
      }
    },
    individual: {
      icon: ShieldAlert,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Business Account Required',
      message: 'Direct checkout is only available for verified business accounts. You can request a quote to get pricing for your order.',
      primaryAction: {
        text: 'Request Quote',
        href: '/request-quote?source=cart'
      },
      secondaryAction: {
        text: 'Upgrade to Business',
        href: '/business-signup'
      }
    },
    unverified: {
      icon: Lock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'Account Verification Required',
      message: 'Your business account must be verified before placing orders. Verification typically takes 1-2 business days.',
      primaryAction: {
        text: 'Complete Verification',
        href: '/profile/verification'
      },
      secondaryAction: {
        text: 'Request Quote Instead',
        href: '/request-quote?source=cart'
      }
    },
    cart_issues: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      title: 'Cart Has Issues',
      message: 'Please review your cart and fix any issues before proceeding to checkout.',
      primaryAction: {
        text: 'Review Cart',
        href: '/cart'
      },
      secondaryAction: {
        text: 'Browse Products',
        href: '/catalog'
      }
    }
  }

  const config = configs[reason]
  const Icon = config.icon

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4" data-testid="blocked-checkout-screen">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-10 h-10 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {config.title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          {config.message}
        </p>

        {/* Item Count Badge (if applicable) */}
        {itemCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 mb-6">
            <span className="font-semibold">{itemCount}</span>
            <span>{itemCount === 1 ? 'item' : 'items'} in cart</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link href={config.primaryAction.href}>
            <Button size="lg" className="w-full">
              {config.primaryAction.text}
            </Button>
          </Link>
          <Link href={config.secondaryAction.href}>
            <Button size="lg" variant="outline" className="w-full">
              {config.secondaryAction.text}
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-full"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

