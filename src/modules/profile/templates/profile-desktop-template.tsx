'use client'

import { useProfile } from '@/lib/hooks/useProfile'
import { PROFILE_SECTIONS, type ProfileSection } from '@/lib/constants/profile'
import ProfileTopbar from '../components/profile-topbar'
import ProfileSidebar from '../components/profile-sidebar'
import QuickActions from '../components/quick-actions'
import RecommendedProducts from '../components/recommended-products'
import { DashboardSection, PersonalInfoSection, AddressesSection, NotificationsSection, PasswordSection, CompanyInfoSection, BusinessVerificationSection } from '../components/sections'
import QuotesSection from '../components/sections/quotes-section'
import QuoteDetailSection from '../components/sections/quote-detail-section'
import SecuritySection from '../components/sections/security-section'
import BusinessDocumentsSection from '../components/sections/business-documents-section'
import PaymentMethodsSection from '../components/sections/payment-methods-section'
import InvoicesSection from '../components/sections/invoices-section'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function ProfileDesktopTemplate() {
  const {
    user,
    addresses,
    notificationPreferences,
    accountType,
    isLoading,
    activeSection,
    setActiveSection,
    updateProfile,
    uploadAvatar,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updateNotificationPreferences,
  } = useProfile()

  const [selectedQuoteNumber, setSelectedQuoteNumber] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Redirect to guest template if not logged in
  if (!user) {
    return null // This will be handled by the page component
  }

  const renderSection = () => {
    switch (activeSection) {
      case PROFILE_SECTIONS.PERSONAL_INFO:
        return (
          <PersonalInfoSection
            user={user}
            onUpdate={updateProfile}
            onUploadAvatar={uploadAvatar}
          />
        )
      
      case PROFILE_SECTIONS.APPROVALS:
        // Business Verification Section
        return (
          <BusinessVerificationSection
            verificationStatus={user.verification_status as any || 'incomplete'}
            rejectionReason={user.verification_rejected_reason}
            onSubmit={async (data) => {
              console.log('Submit verification:', data)
              // TODO: Implement verification submission
              // 1. Upload documents to Supabase Storage
              // 2. Update user_profiles with verification data
              // 3. Set verification_status to 'pending'
              // 4. Send notification to admin
            }}
          />
        )
      
      case PROFILE_SECTIONS.ADDRESSES:
        return (
          <AddressesSection
            addresses={addresses}
            onAdd={addAddress}
            onUpdate={updateAddress}
            onDelete={deleteAddress}
            onSetDefault={setDefaultAddress}
          />
        )
      
      case PROFILE_SECTIONS.NOTIFICATIONS:
        return (
          <NotificationsSection
            preferences={notificationPreferences}
            onUpdate={updateNotificationPreferences}
          />
        )
      
      case PROFILE_SECTIONS.CHANGE_PASSWORD:
        return (
          <PasswordSection
            onUpdate={async (currentPassword, newPassword) => {
              console.log('Update password:', { currentPassword, newPassword })
              // TODO: Implement password update
              // 1. Verify current password with Supabase
              // 2. Update password using Supabase auth
              // 3. Log out user from all sessions
            }}
          />
        )
      
      case PROFILE_SECTIONS.WISHLISTS:
        // Dynamically import WishlistSection to avoid circular dependencies
        const WishlistSection = require('../components/sections/wishlist-section').default
        return <WishlistSection />
      
      case PROFILE_SECTIONS.QUOTES:
        // Show quote detail if a quote is selected, otherwise show quotes list
        if (selectedQuoteNumber) {
          return (
            <QuoteDetailSection
              quoteNumber={selectedQuoteNumber}
              onBack={() => setSelectedQuoteNumber(null)}
            />
          )
        }
        return (
          <QuotesSection
            accountType={accountType}
            verificationStatus={user.verification_status as any || 'incomplete'}
          />
        )
      
      case PROFILE_SECTIONS.SECURITY:
        return <SecuritySection />
      
      case PROFILE_SECTIONS.BUSINESS_DOCUMENTS:
        return (
          <BusinessDocumentsSection
            accountType={accountType}
            verificationStatus={user.verification_status as any || 'incomplete'}
          />
        )
      
      case PROFILE_SECTIONS.PAYMENT_METHODS:
        return (
          <PaymentMethodsSection
            accountType={accountType}
            verificationStatus={user.verification_status as any || 'incomplete'}
          />
        )
      
      case PROFILE_SECTIONS.INVOICES:
        return (
          <InvoicesSection
            accountType={accountType}
            verificationStatus={user.verification_status as any || 'incomplete'}
          />
        )
      
      case PROFILE_SECTIONS.OVERVIEW:
      default:
        return (
          <DashboardSection
            user={user}
            accountType={accountType}
            verificationStatus={user.verification_status as any || 'incomplete'}
            stats={{
              totalOrders: 0, // TODO: Fetch from Medusa
              totalQuotes: 0, // TODO: Fetch from database
              activeQuotes: 0, // TODO: Fetch from database
              totalSpent: 0, // TODO: Calculate from orders
              quotesValue: 0, // TODO: Calculate from quotes
              savedItems: 0, // TODO: Get from wishlist
            }}
            recentOrders={[]} // TODO: Fetch recent orders
            recentQuotes={[]} // TODO: Fetch recent quotes
            recentActivity={[]} // TODO: Fetch activity log
            wishlistItems={[]} // TODO: Get wishlist items
            onSectionChange={(section: string) => setActiveSection(section as ProfileSection)}
          />
        )
    }
  }

  return (
    <>
      <style jsx global>{`
        .profile-page-main footer .footer-about-section {
          display: none;
        }
      `}</style>
      <div className="flex h-screen w-full flex-col">
        {/* Topbar */}
        <ProfileTopbar user={user} accountType={accountType} />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <ProfileSidebar
            user={user}
            accountType={accountType}
            activeSection={activeSection}
            verificationStatus={user.verification_status as any || 'incomplete'}
            onSectionChange={setActiveSection}
          />

          {/* Content Area - Scrollable */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="p-6 md:p-8">
              {renderSection()}
            </div>
            
            {/* Recommended Products Section */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <RecommendedProducts />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
