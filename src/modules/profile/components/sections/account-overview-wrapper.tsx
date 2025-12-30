'use client'

import { useProfile } from '@/lib/hooks/useProfile'
import AccountOverviewSection from './account-overview-section'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PROFILE_SECTIONS } from '@/lib/constants/profile'

// Map sections to routes
const sectionToRoute: Record<string, string> = {
  [PROFILE_SECTIONS.OVERVIEW]: '/profile',
  [PROFILE_SECTIONS.PERSONAL_INFO]: '/profile/account',
  [PROFILE_SECTIONS.BUSINESS_INFO]: '/profile/account',
  [PROFILE_SECTIONS.ADDRESSES]: '/profile/addresses',
  [PROFILE_SECTIONS.NOTIFICATIONS]: '/profile/notifications',
  [PROFILE_SECTIONS.CHANGE_PASSWORD]: '/profile/password',
  [PROFILE_SECTIONS.WISHLISTS]: '/profile/wishlist',
  [PROFILE_SECTIONS.QUOTES]: '/profile/quotes',
  [PROFILE_SECTIONS.ORDER_HISTORY]: '/profile/orders',
  [PROFILE_SECTIONS.APPROVALS]: '/profile/verification',
  [PROFILE_SECTIONS.SECURITY]: '/profile/password',
}

export default function AccountOverviewWrapper() {
  const router = useRouter()
  const { user, accountType, isLoading } = useProfile()

  const handleNavigate = (section: string) => {
    const route = sectionToRoute[section]
    if (route) {
      router.push(route)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading account...</p>
        </div>
      </div>
    )
  }

  // Guest users or no user shouldn't see the account overview
  if (!user || accountType === 'guest') {
    return null
  }

  return (
    <AccountOverviewSection
      user={user}
      accountType={accountType as 'individual' | 'business'}
      verificationStatus={user.verification_status as any || 'incomplete'}
      onNavigate={handleNavigate}
    />
  )
}
