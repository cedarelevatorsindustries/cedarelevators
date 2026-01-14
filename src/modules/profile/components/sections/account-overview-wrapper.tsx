'use client'

import { useUser } from '@/lib/auth/client'
import AccountOverviewSection from './account-overview-section'
import BusinessInfoDisplay from './business-info-display'
import AddressesSectionWrapper from './addresses-section-wrapper'
import OrdersLinkSection from './orders-link-section'
import SecurityLinkSection from './security-link-section'
import { BusinessVerificationCard } from '@/components/business-verification-card'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PROFILE_SECTIONS } from '@/lib/constants/profile'

// Map sections to routes
const sectionToRoute: Record<string, string> = {
  [PROFILE_SECTIONS.OVERVIEW]: '/profile',
  [PROFILE_SECTIONS.PERSONAL_INFO]: '/profile/account',
  [PROFILE_SECTIONS.BUSINESS_INFO]: '/profile/business',
  [PROFILE_SECTIONS.ADDRESSES]: '/profile/addresses',
  [PROFILE_SECTIONS.NOTIFICATIONS]: '/profile/notifications',
  [PROFILE_SECTIONS.CHANGE_PASSWORD]: '/profile/password',
  [PROFILE_SECTIONS.WISHLISTS]: '/profile/wishlist',
  [PROFILE_SECTIONS.QUOTES]: '/profile/quotes',
  [PROFILE_SECTIONS.ORDER_HISTORY]: '/profile/orders',
  [PROFILE_SECTIONS.APPROVALS]: '/profile/verification',
  [PROFILE_SECTIONS.SECURITY]: '/profile/security',
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
  // Prioritize clerkUser for immediate updates (firstName, lastName)
  const userProfile = {
    first_name: clerkUser?.firstName || user.name?.split(' ')[0] || '',
    last_name: clerkUser?.lastName || user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    avatar_url: user.imageUrl || clerkUser?.imageUrl || null,
    company_name: user.business?.name || null,
    verification_status: user.business?.verification_status || null
  }

  const accountType = user.activeProfile?.profile_type === 'business' ? 'business' : 'individual'
  const isBusinessUser = accountType === 'business'
  const isVerified = user.business?.verification_status === 'verified'

  // Determine if user should see Orders link
  const showOrdersLink = accountType === 'individual' || (isBusinessUser && isVerified)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="p-6 sm:p-8 lg:p-10 space-y-8">
        {/* 1. Account Overview Section */}
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

        {/* 2. Business Information Section (Verified Business Only) */}
        {isBusinessUser && isVerified && (
          <BusinessInfoDisplay
            companyName={user.business?.verification_data?.legal_business_name || user.business?.name || user.name || ''}
            email={user.email || ''}
            phone={user.business?.verification_data?.contact_person_phone || user.phone || undefined}
            taxId={user.business?.verification_data?.gstin || undefined}
            industry="" // Placeholder, add to verification data if available
            companySize="" // Placeholder
          />
        )}

        {/* 3. Addresses Section (All Users) */}
        <AddressesSectionWrapper verifiedBusinessData={user.business?.verification_data} />

        {/* 4. Orders Link Section (Individual + Verified Business) */}
        {showOrdersLink && (
          <OrdersLinkSection />
        )}

        {/* 5. Security Link Section */}
        <SecurityLinkSection />
      </div>
    </div>
  )
}


