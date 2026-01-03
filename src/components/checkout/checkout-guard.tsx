/**
 * Comprehensive Checkout Guard
 * Cedar Elevator Industries
 * 
 * Guards the entire checkout route and handles all redirect logic
 * Based on user type and verification status
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { useCart } from '@/contexts/cart-context'
import { checkCheckoutEligibility } from '@/lib/actions/checkout'
import { GuestCheckoutBlocked } from './guest-checkout-blocked'
import { IndividualCheckoutBlocked } from './individual-checkout-blocked'
import { UnverifiedBusinessCheckoutBlocked } from './unverified-business-checkout-blocked'

interface CheckoutGuardProps {
  children: React.ReactNode
}

type BlockReason = 
  | 'loading'
  | 'not_authenticated'
  | 'individual_user'
  | 'not_verified'
  | 'cart_empty'
  | 'cart_issues'
  | 'eligible'

export function CheckoutGuard({ children }: CheckoutGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const { cart, summary } = useCart()
  
  const [blockReason, setBlockReason] = useState<BlockReason>('loading')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkEligibility() {
      setIsChecking(true)

      // Wait for Clerk to load
      if (!isLoaded) {
        setBlockReason('loading')
        return
      }

      // Check 1: User must be signed in
      if (!isSignedIn || !user) {
        setBlockReason('not_authenticated')
        setIsChecking(false)
        return
      }

      // Check 2: Get user type from metadata
      const accountType = user.publicMetadata?.accountType as string
      
      if (accountType !== 'business') {
        setBlockReason('individual_user')
        setIsChecking(false)
        return
      }

      // EDGE CASE: Check 3: Business verification status (real-time check)
      const verificationStatus = user.publicMetadata?.verificationStatus as string
      if (verificationStatus !== 'verified') {
        setBlockReason('not_verified')
        setIsChecking(false)
        
        // Show warning if verification was lost mid-checkout
        if (pathname?.includes('/checkout') && verificationStatus === 'pending') {
          toast.error('Your business verification status has changed. Please complete verification to proceed.')
        }
        return
      }

      // Check 4: Cart must have items
      if (!cart || summary.itemCount === 0) {
        setBlockReason('cart_empty')
        // Redirect to cart for empty cart
        router.push('/cart')
        return
      }

      // Check 5: Server-side eligibility check
      if (cart.id) {
        const result = await checkCheckoutEligibility(cart.id)
        
        if (!result.success || !result.data?.eligible) {
          if (result.data?.reason === 'stock_issues') {
            setBlockReason('cart_issues')
            toast.error('Some items in your cart are no longer available. Please review your cart.')
            // Redirect to cart to fix issues
            router.push('/cart')
            return
          }
          
          // Other server-side validation failures
          setBlockReason(result.data?.reason as BlockReason || 'cart_issues')
          setIsChecking(false)
          return
        }
      }

      // All checks passed
      setBlockReason('eligible')
      setIsChecking(false)
    }

    checkEligibility()
    
    // EDGE CASE: Re-check eligibility every 30 seconds during checkout
    const intervalId = setInterval(() => {
      if (pathname?.includes('/checkout')) {
        checkEligibility()
      }
    }, 30000)
    
    return () => clearInterval(intervalId)
  }, [isLoaded, isSignedIn, user, cart, summary, router, pathname])

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

  // Show appropriate blocked screen
  if (blockReason === 'not_authenticated') {
    return <GuestCheckoutBlocked />
  }

  if (blockReason === 'individual_user') {
    return <IndividualCheckoutBlocked />
  }

  if (blockReason === 'not_verified') {
    return <UnverifiedBusinessCheckoutBlocked />
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
