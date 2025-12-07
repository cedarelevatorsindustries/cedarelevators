'use client'

import { useProfile } from '@/lib/hooks/useProfile'
import DashboardSection from './dashboard-section'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PROFILE_SECTIONS } from '@/lib/constants/profile'

// Map sections to routes
const sectionToRoute: Record<string, string> = {
  [PROFILE_SECTIONS.OVERVIEW]: '/profile',
  [PROFILE_SECTIONS.PERSONAL_INFO]: '/profile/account',
  [PROFILE_SECTIONS.ADDRESSES]: '/profile/addresses',
  [PROFILE_SECTIONS.NOTIFICATIONS]: '/profile/notifications',
  [PROFILE_SECTIONS.CHANGE_PASSWORD]: '/profile/password',
  [PROFILE_SECTIONS.WISHLISTS]: '/profile/wishlist',
  [PROFILE_SECTIONS.QUOTES]: '/profile/quotes',
  [PROFILE_SECTIONS.ORDER_HISTORY]: '/profile/orders',
  [PROFILE_SECTIONS.APPROVALS]: '/profile/verification',
}

export default function DashboardSectionWrapper() {
  const router = useRouter()
  const { user, accountType, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Guest users shouldn't see the dashboard
  if (accountType === 'guest') {
    return null
  }

  const handleSectionChange = (section: string) => {
    const route = sectionToRoute[section]
    if (route) {
      router.push(route)
    }
  }

  return (
    <DashboardSection
      user={user}
      accountType={accountType as 'individual' | 'business'}
      verificationStatus={user.verification_status as any || 'incomplete'}
      stats={{
        totalOrders: 0,
        totalQuotes: 0,
        activeQuotes: 0,
        totalSpent: 0,
        quotesValue: 0,
        savedItems: 0,
      }}
      recentOrders={[]}
      recentQuotes={[]}
      recentActivity={[]}
      wishlistItems={[]}
      onSectionChange={handleSectionChange}
    />
  )
}
