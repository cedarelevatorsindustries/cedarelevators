'use client'

import { UserProfile } from '@/lib/types/profile'
import AccountCard from './account-card'
import MobileMenu from './mobile-menu'

interface BusinessMenuProps {
  user: UserProfile
  isVerified: boolean
}

/**
 * Business User Mobile Profile
 * 
 * Menu structure varies based on verification:
 * 
 * UNVERIFIED (10 items):
 * - Account: Business Info, Verification (Pending), Addresses
 * - Activity: Quotes, Orders
 * - Settings: Notifications, Security
 * - Support & Auth: Help Center, Contact Support, Logout
 * 
 * VERIFIED (11 items):
 * - Account: Business Info, Addresses, Payment Preferences
 * - Activity: Quotes, Orders, Invoices
 * - Settings: Notifications, Security
 * - Support & Auth: Help Center, Contact Support, Logout
 */
export default function BusinessMenu({ user, isVerified }: BusinessMenuProps) {
  const displayName = `${user.first_name} ${user.last_name}`.trim() || 'User'
  const companyName = user.company_name
  
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <AccountCard
        accountType="business"
        isVerified={isVerified}
        user={{
          name: displayName,
          email: user.email,
          companyName: companyName,
          avatarUrl: user.avatar_url
        }}
      />
      <MobileMenu accountType="business" isVerified={isVerified} />
    </div>
  )
}
