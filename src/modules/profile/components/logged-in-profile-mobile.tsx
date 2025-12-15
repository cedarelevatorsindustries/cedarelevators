'use client'

import { UserProfile } from '@/lib/types/profile'
import ProfileMobileTemplate from '../templates/profile-mobile-template'

interface LoggedInProfileMobileProps {
  user: UserProfile
  accountType: 'individual' | 'business'
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
  stats?: {
    totalOrders: number
    totalSpent: number
    savedItems: number
  }
}

/**
 * Logged In Profile Mobile Component
 * 
 * This is a wrapper component that uses the ProfileMobileTemplate.
 * It matches the design system from the guest profile mobile view.
 * 
 * Features:
 * - User profile header with avatar and verification badges
 * - Stats cards showing orders, spend, and saved items
 * - Account type indicator (Individual/Business)
 * - Verification status for business accounts
 * - Modular menu sections for easy maintenance
 * - Red logout button matching design requirements
 */
export default function LoggedInProfileMobile({
  user,
  accountType,
  verificationStatus = 'incomplete',
  stats = { totalOrders: 0, totalSpent: 0, savedItems: 0 }
}: LoggedInProfileMobileProps) {
  return (
    <ProfileMobileTemplate
      user={user}
      accountType={accountType}
      verificationStatus={verificationStatus}
      stats={stats}
    />
  )
}
