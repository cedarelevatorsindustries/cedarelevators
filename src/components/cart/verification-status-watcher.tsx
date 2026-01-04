/**
 * Business Verification Status Change Handler
 * Detects and handles changes in business verification status
 */

'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'

export function VerificationStatusWatcher() {
  const { user } = useUser()
  const { refreshCart } = useCart()

  useEffect(() => {  
    if (!user) return

    const verificationStatus = user.publicMetadata?.verificationStatus as string

    // Check if verification status changed (you'd need to store previous state)
    // For now, just refresh cart when component mounts if user is verified
    if (verificationStatus === 'verified') {
      const hasNotified = sessionStorage.getItem('verification_cart_refresh')
      
      if (!hasNotified) {
        toast.success(
          'Congratulations! Your business is now verified. You can now checkout and view pricing.',
          { duration: 5000 }
        )
        sessionStorage.setItem('verification_cart_refresh', 'true')
        refreshCart()
      }
    }
  }, [user, refreshCart])

  return null // This is a logic-only component
}

