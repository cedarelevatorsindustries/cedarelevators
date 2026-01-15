/**
 * Unified Checkout Guard
 * Cedar Elevator Industries
 * 
 * Guards checkout route with support for:
 * - Cart checkout (business verified only)
 * - Quote checkout (approved quotes for all user types)
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useCart } from '@/contexts/cart-context'
import { useUserPricing } from '@/lib/hooks/useUserPricing'
import { checkCheckoutEligibility } from '@/lib/actions/checkout'
import { GuestCheckoutBlocked } from './guest-checkout-blocked'
import { IndividualCheckoutBlocked } from './individual-checkout-blocked'
import { UnverifiedBusinessCheckoutBlocked } from './unverified-business-checkout-blocked'
import { toast } from 'sonner'

interface CheckoutGuardProps {
  children: React.ReactNode
}

type CheckoutSource = 'cart' | 'quote'

type BlockReason =
  | 'loading'
  | 'not_authenticated'
  | 'individual_cart'
  | 'unverified_cart'
  | 'cart_empty'
  | 'cart_issues'
  | 'quote_not_approved'
  | 'quote_not_found'
  | 'eligible'

export function CheckoutGuard({ children }: CheckoutGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const { cart, summary } = useCart()
  const { userType: pricingUserType, isVerified, isLoaded: isPricingLoaded } = useUserPricing()

  const [blockReason, setBlockReason] = useState<BlockReason>('loading')
  const [isChecking, setIsChecking] = useState(true)

  // Determine checkout source from URL
  const source: CheckoutSource = (searchParams?.get('source') as CheckoutSource) || 'cart'
  const quoteId = searchParams?.get('quoteId')

  // Map pricing user type to cart user type
  const getUserType = () => {
    if (!isSignedIn) return 'guest'
    if (pricingUserType === 'business' && isVerified) return 'business_verified'
    if (pricingUserType === 'business' && !isVerified) return 'business_unverified'
    return 'individual'
  }

  const userType = getUserType()

  useEffect(() => {
    async function checkEligibility() {
      setIsChecking(true)

      // Wait for auth and pricing to load
      if (!isAuthLoaded || !isPricingLoaded) {
        setBlockReason('loading')
        return
      }

      // Check 1: User must be signed in
      if (!isSignedIn) {
        setBlockReason('not_authenticated')
        setIsChecking(false)
        return
      }

      // CART CHECKOUT FLOW
      if (source === 'cart') {
        // Only business_verified can checkout via cart
        if (userType === 'individual') {
          setBlockReason('individual_cart')
          setIsChecking(false)
          return
        }

        if (userType === 'business_unverified') {
          setBlockReason('unverified_cart')
          setIsChecking(false)
          return
        }

        // Check cart has items
        if (!cart || summary.itemCount === 0) {
          setBlockReason('cart_empty')
          router.push('/cart')
          return
        }

        // Server-side cart eligibility check
        if (cart.id) {
          const result = await checkCheckoutEligibility(cart.id)

          if (!result.success || !result.data?.eligible) {
            if (result.data?.reason === 'stock_issues') {
              setBlockReason('cart_issues')
              toast.error('Some items in your cart are no longer available. Please review your cart.')
              router.push('/cart')
              return
            }

            setBlockReason(result.data?.reason as BlockReason || 'cart_issues')
            setIsChecking(false)
            return
          }
        }
      }

      // QUOTE CHECKOUT FLOW
      if (source === 'quote') {
        if (!quoteId) {
          toast.error('Invalid quote ID')
          router.push('/quotes')
          return
        }

        // All user types (individual, business_unverified, business_verified) can checkout via approved quotes
        // TODO: Check quote status in Phase 2 when we create getCheckoutFromQuote
        // For now, we'll allow it through and handle in the checkout page
      }

      // All checks passed
      setBlockReason('eligible')
      setIsChecking(false)
    }

    checkEligibility()

    // Re-check eligibility every 30 seconds during checkout
    const intervalId = setInterval(() => {
      if (pathname?.includes('/checkout')) {
        checkEligibility()
      }
    }, 30000)

    return () => clearInterval(intervalId)
  }, [isAuthLoaded, isPricingLoaded, isSignedIn, userType, cart, summary, source, quoteId, router, pathname])

  // Show loading state
  if (isChecking || blockReason === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying checkout eligibility...</p>
        </div>
      </div>
    )
  }

  // Show appropriate blocked screens
  if (blockReason === 'not_authenticated') {
    return <GuestCheckoutBlocked />
  }

  if (blockReason === 'individual_cart' || blockReason === 'unverified_cart') {
    return <IndividualCheckoutBlocked />
  }

  // Eligible - show checkout
  return <>{children}</>
}

/**
 * Hook to check if profile switching should be blocked
 */
export function useCheckoutSessionLock() {
  const pathname = usePathname()
  const isInCheckout = pathname?.startsWith('/checkout') || false

  return {
    isInCheckout,
    canSwitchProfile: !isInCheckout,
    warningMessage: isInCheckout
      ? 'Profile switching is disabled during checkout. Please complete or cancel your checkout first.'
      : null
  }
}
