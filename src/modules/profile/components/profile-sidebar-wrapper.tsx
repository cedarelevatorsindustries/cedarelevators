'use client'

import { usePathname, useRouter } from 'next/navigation'
import ProfileSidebar from './profile-sidebar'
import { UserProfile, AccountType } from '@/lib/types/profile'
import { ProfileSection, PROFILE_SECTIONS } from '@/lib/constants/profile'

interface ProfileSidebarWrapperProps {
  user: UserProfile
  accountType: AccountType
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
  className?: string
}

// Map routes to sections
const routeToSection: Record<string, ProfileSection> = {
  '/profile': PROFILE_SECTIONS.OVERVIEW,
  '/profile/account': PROFILE_SECTIONS.PERSONAL_INFO,
  '/profile/addresses': PROFILE_SECTIONS.ADDRESSES,
  '/profile/notifications': PROFILE_SECTIONS.NOTIFICATIONS,
  '/profile/password': PROFILE_SECTIONS.CHANGE_PASSWORD,
  '/profile/wishlist': PROFILE_SECTIONS.WISHLISTS,
  '/profile/quotes': PROFILE_SECTIONS.QUOTES,
  '/profile/orders': PROFILE_SECTIONS.ORDER_HISTORY,
  '/profile/verification': PROFILE_SECTIONS.APPROVALS,
}

// Map sections to routes
const sectionToRoute: Partial<Record<ProfileSection, string>> = {
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

export default function ProfileSidebarWrapper({
  user,
  accountType,
  verificationStatus = 'incomplete',
  className,
}: ProfileSidebarWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const activeSection = routeToSection[pathname] || PROFILE_SECTIONS.OVERVIEW

  const handleSectionChange = (section: ProfileSection) => {
    const route = sectionToRoute[section]
    if (route) {
      router.push(route)
    }
  }

  return (
    <ProfileSidebar
      user={user}
      accountType={accountType}
      activeSection={activeSection}
      verificationStatus={verificationStatus}
      onSectionChange={handleSectionChange}
      className={className}
    />
  )
}

