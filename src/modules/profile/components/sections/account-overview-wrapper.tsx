'use client'

import { useUser } from '@/lib/auth/client'
import AccountOverviewSection from './account-overview-section'
import { BusinessVerificationCard } from '@/components/business-verification-card'
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
  [PROFILE_SECTIONS.APPROVALS]: '/profile/business/verification',
  [PROFILE_SECTIONS.SECURITY]: '/profile/password',
}

export default function AccountOverviewWrapper() {
  const router = useRouter()
  const { user, isLoading, clerkUser } = useUser()

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
  if (!user || user.userType === 'guest') {
    return null
  }

  // Convert user data to old UserProfile format for compatibility
  const userProfile = {
    first_name: user.name?.split(' ')[0] || '',
    last_name: user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    avatar_url: user.imageUrl || clerkUser?.imageUrl || null,
    company_name: user.business?.name || null,
    verification_status: user.business?.verification_status || null
  }

  const accountType = user.activeProfile?.profile_type === 'business' ? 'business' : 'individual'

  return (
    <div className="space-y-6">
      <AccountOverviewSection
        user={userProfile as any}
        accountType={accountType}
        verificationStatus={
          user.business?.verification_status === 'verified' ? 'approved' :
            user.business?.verification_status === 'pending' ? 'pending' :
              user.business?.verification_status === 'rejected' ? 'rejected' : 'incomplete'
        }
        onNavigate={handleNavigate}
      />

      {/* Business Verification Card */}
      {accountType === 'business' && user.business && (
        <BusinessVerificationCard business={user.business} />
      )}
    </div>
  )
}

