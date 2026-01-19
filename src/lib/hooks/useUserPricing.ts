"use client"

import { useUser } from "@/lib/auth/client"
import { useAccountType } from "./use-account-type"

export type UserType = 'guest' | 'individual' | 'business'
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete'

export interface UserPricingInfo {
  userType: UserType
  verificationStatus?: VerificationStatus
  isVerified: boolean
  isLoaded: boolean
  canSeePrices: boolean
  canAddToCart: boolean
  canCheckout: boolean
  canRequestQuote: boolean
}


export function useUserPricing(): UserPricingInfo {
  const { user, isLoaded } = useUser()
  const { accountType, isBusiness, isIndividual, isGuest } = useAccountType()

  // Get verification status from enhanced user object (from /api/auth/profile)
  const isVerified = user?.business?.verification_status === 'verified'

  // Map database verification status to component-friendly status
  const dbStatus = user?.business?.verification_status
  const verificationStatus: VerificationStatus =
    dbStatus === 'verified' ? 'approved' :
      dbStatus === 'pending' ? 'pending' :
        dbStatus === 'rejected' ? 'rejected' : 'incomplete'

  // Determine user type
  let userType: UserType = 'guest'
  if (user) {
    userType = isBusiness ? 'business' : 'individual'
  }


  // Pricing visibility logic based on strategy:
  // - Guest: No prices
  // - Individual: No prices
  // - Business (Unverified): No prices (must be verified first)
  // - Verified Business: Show prices + direct buy
  const canSeePrices = isBusiness && isVerified


  // Cart/Checkout logic:
  // - Only verified business can add to cart and checkout
  const canAddToCart = isBusiness && isVerified
  const canCheckout = isBusiness && isVerified

  // Quote logic:
  // - Everyone can request quotes (with different limits)
  const canRequestQuote = true

  return {
    userType,
    verificationStatus,
    isVerified,
    isLoaded,
    canSeePrices,
    canAddToCart,
    canCheckout,
    canRequestQuote,
  }

}

