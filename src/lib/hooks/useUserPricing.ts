export type UserType = 'guest' | 'individual' | 'business'
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete'

export interface UserPricingInfo {
  userType: UserType
  verificationStatus?: VerificationStatus
  isVerified: boolean
}

export function useUserPricing(): UserPricingInfo {
  // TODO: Implement actual user pricing hook
  return {
    userType: 'guest',
    verificationStatus: 'incomplete',
    isVerified: false,
  }
}
