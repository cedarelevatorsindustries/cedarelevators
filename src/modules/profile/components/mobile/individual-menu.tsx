'use client'

import { UserProfile } from '@/lib/types/profile'
import AccountCard from './account-card'
import MobileMenu from './mobile-menu'

interface IndividualMenuProps {
  user: UserProfile
}

/**
 * Individual User Mobile Profile
 * 
 * Menu structure:
 * - Account: Profile Overview, Personal Info, Addresses
 * - Activity: Quotes, Orders, Wishlist
 * - Settings: Notifications, Security
 * - Support & Auth: Help Center, Contact Support, Logout
 * 
 * Total: 11 items (as per spec)
 */
export default function IndividualMenu({ user }: IndividualMenuProps) {
  const displayName = `${user.first_name} ${user.last_name}`.trim() || 'User'
  
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <AccountCard
        accountType="individual"
        user={{
          name: displayName,
          email: user.email,
          avatarUrl: user.avatar_url
        }}
      />
      <MobileMenu accountType="individual" />
    </div>
  )
}

