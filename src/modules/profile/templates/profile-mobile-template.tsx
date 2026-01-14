'use client'

import { useUser } from '@/lib/auth/client'
import { LoaderCircle } from 'lucide-react'
import { GuestMenu, IndividualMenu, BusinessMenu } from '../components/mobile'
import type { UserProfile } from '@/lib/types/profile'

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
  const { user, isLoading } = useUser()

  // Loading state
  if (isLoading || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoaderCircle size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Guest user
  if (!user) {
    return <GuestMenu />
  }

  // Determine account type
  const accountType = user.userType || 'individual'

  // Map user data to expected format
  const mappedUser: UserProfile = {
    id: user.id,
    first_name: user.name?.split(' ')[0] || '',
    last_name: user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    phone: user.phone || undefined,
    avatar_url: user.imageUrl || undefined,
    verification_status: (user.business?.verification_status === 'verified' ? 'approved' :
      user.business?.verification_status === 'pending' ? 'pending' :
        user.business?.verification_status === 'rejected' ? 'rejected' : 'incomplete') as 'pending' | 'approved' | 'rejected' | 'incomplete',
    company_name: user.business?.name || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Individual user
  if (accountType === 'individual') {
    return <IndividualMenu user={mappedUser} />
  }

  // Business user
  if (accountType === 'business' || accountType === 'verified') {
    const isVerified = user.isVerified || false
    return <BusinessMenu user={mappedUser} isVerified={isVerified} />
  }

  // Fallback (should never reach here)
  return <GuestMenu />
}


