"use client"

import { useUser } from "@clerk/nextjs"
import { useAccountType } from "./use-account-type"

export type UserType = 'guest' | 'individual' | 'business'
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete'

export interface UserPricingInfo {
  userType: UserType
  verificationStatus?: VerificationStatus
  isVerified: boolean
  canSeePrices: boolean
  canAddToCart: boolean
  canCheckout: boolean
  canRequestQuote: boolean
}

export function useUserPricing(): UserPricingInfo {
  const { isSignedIn, user, isLoaded } = useUser()
  const { accountType, isBusiness, isIndividual, isGuest } = useAccountType()

  // Get verification status from user metadata
  const isVerified = user?.unsafeMetadata?.is_verified === true ||
    user?.publicMetadata?.is_verified === true

  const verificationStatus = (user?.unsafeMetadata?.verification_status as VerificationStatus) ||
    (isVerified ? 'approved' : 'incomplete')

  // Determine user type
  let userType: UserType = 'guest'
  if (isSignedIn) {
    userType = isBusiness ? 'business' : 'individual'
  }

  // Pricing visibility logic based on strategy:
  // - Guest: No prices
  // - Individual: No prices
  // - Business (Unverified): Show prices but no direct buy
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
    canSeePrices,
    canAddToCart,
    canCheckout,
    canRequestQuote,
  }
}
