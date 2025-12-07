'use client'

import { UserProfile } from '@/lib/types/profile'
import {
  ProfileHeader,
  ProfileStats,
  AccountSection,
  BusinessSection,
  OrderToolsSection,
  DownloadSection,
  SupportSection,
  PoliciesSection,
  LogoutButton
} from '../components/mobile'

interface ProfileMobileTemplateProps {
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
 * Mobile Profile Template
 * 
 * This template orchestrates all mobile profile sections in a modular way.
 * Each section is a separate component that can be reused or modified independently.
 * 
 * Structure:
 * 1. ProfileHeader - User avatar, name, email, account type, verification badges
 * 2. ProfileStats - Total orders, total spend, saved items cards
 * 3. AccountSection - Edit Profile, Account Settings (no notifications - in top bar)
 * 4. BusinessSection - Business Profile, Verification (business accounts only)
 * 5. OrderToolsSection - My Orders, Track Order, Saved Items, Quick Reorder
 * 6. DownloadSection - Download Center
 * 7. SupportSection - Help & FAQ, Contact Sales, WhatsApp Support
 * 8. PoliciesSection - Warranty, Shipping, Returns, Privacy, Terms, Payment Terms
 * 9. LogoutButton - Red logout button at bottom
 * 
 * Note: Quote-related features (Request Quote, My Quotations, Bulk Orders) are in the Quote tab
 */
export default function ProfileMobileTemplate({
  user,
  accountType,
  verificationStatus = 'incomplete',
  stats = { totalOrders: 0, totalSpent: 0, savedItems: 0 }
}: ProfileMobileTemplateProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20 relative z-0">
      {/* User Profile Header with Avatar & Badges */}
      <ProfileHeader 
        user={user} 
        accountType={accountType} 
        verificationStatus={verificationStatus} 
      />
      
      {/* Stats Cards - Orders, Spend, Saved Items */}
      <ProfileStats stats={stats} />
      
      {/* My Account Menu */}
      <AccountSection />
      
      {/* Business Section - Only for Business Accounts */}
      {accountType === 'business' && (
        <BusinessSection verificationStatus={verificationStatus} />
      )}
      
      {/* Order Management Menu */}
      <OrderToolsSection accountType={accountType} />
      
      {/* Download Center */}
      <DownloadSection />
      
      {/* Support & Help Menu */}
      <SupportSection />
      
      {/* Policies Menu */}
      <PoliciesSection />
      
      {/* Logout Button */}
      <LogoutButton />
    </div>
  )
}
