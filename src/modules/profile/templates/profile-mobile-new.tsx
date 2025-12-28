'use client'

import { useProfile } from '@/lib/hooks/useProfile'
import { Loader2 } from 'lucide-react'
import { GuestMenu, IndividualMenu, BusinessMenu } from '../components/mobile'

/**
 * New Mobile Profile Template
 * 
 * Renders role-appropriate mobile profile menu:
 * - Guest: Sign in prompts + minimal menu
 * - Individual: Personal account menu
 * - Business: Business account menu (with verification status)
 * 
 * NO stats, NO dashboard, NO quick actions
 * Pure navigation + identity + settings + history
 */
export default function ProfileMobileNew() {
  const { user, accountType, isLoading } = useProfile()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Guest user
  if (accountType === 'guest' || !user) {
    return <GuestMenu />
  }

  // Individual user
  if (accountType === 'individual') {
    return <IndividualMenu user={user} />
  }

  // Business user
  if (accountType === 'business') {
    const isVerified = user.verification_status === 'approved'
    return <BusinessMenu user={user} isVerified={isVerified} />
  }

  // Fallback (should never reach here)
  return <GuestMenu />
}
