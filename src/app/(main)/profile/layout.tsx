'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import ProfileTopbar from '@/modules/profile/components/profile-topbar'
import ProfileSidebarWrapper from '@/modules/profile/components/profile-sidebar-wrapper'
import ProfileMobileNew from '@/modules/profile/templates/profile-mobile-new'

type AccountType = 'individual' | 'business'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, user } = useUser()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // Check initially
    checkMobile()

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Client-side auth check
  useEffect(() => {
    // If not loaded yet, do nothing
    if (!isLoaded) return;

    const isMobileScreen = window.innerWidth < 1024

    // Redirect if no user AND not on mobile
    // On mobile, we want to show the guest profile view
    if (!user && !isMobileScreen) {
      router.push('/sign-in?redirect=/profile')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    // Make navbar gray on mount
    const navbar = document.querySelector('nav')
    if (navbar) {
      navbar.style.backgroundColor = 'rgb(249, 250, 251)'
      navbar.style.borderBottomColor = 'rgb(229, 231, 235)'
    }

    // Hide floating action card on profile pages (but NOT the bottom navigation)
    // Look for floating cards that are NOT the bottom navigation (which has grid-cols-5)
    const floatingCards = document.querySelectorAll('[class*="fixed"][class*="bottom-"]')

    let targetCard: HTMLElement | null = null

    floatingCards.forEach((card) => {
      const element = card as HTMLElement
      // Skip if it's the bottom navigation (has grid-cols-5 class)
      if (element.querySelector('[class*="grid-cols-5"]')) {
        return
      }
      // Skip if it is part of the profile layout (like the sidebar)
      if (element.closest('.profile-layout-wrapper')) {
        return
      }
      // Find the floating action card (has svg with specific viewBox)
      if (element.querySelector('svg[viewBox="0 0 24 24"]')) {
        targetCard = element
        element.style.display = 'none'
      }
    })

    // Cleanup on unmount
    return () => {
      if (navbar) {
        navbar.style.backgroundColor = ''
        navbar.style.borderBottomColor = ''
      }
      if (targetCard) {
        targetCard.style.display = ''
      }
    }
  }, [])

  // Show loading state while auth is loading
  if (!isLoaded) {
    return null
  }

  // Handle Guest Mobile View
  if (!user) {
    if (isMobile) {
      return (
        <div className="min-h-screen bg-white pt-16 lg:pt-0">
          <ProfileMobileNew />
        </div>
      )
    }
    // For desktop, we return null while redirecting
    return null
  }

  // Map Clerk user to UserProfile format
  const userProfile = {
    id: user.id,
    first_name: user.firstName || '',
    last_name: user.lastName || '',
    email: user.primaryEmailAddress?.emailAddress || '',
    avatar_url: user.imageUrl,
    company_id: user.unsafeMetadata?.companyId as string | undefined,
    account_type: (user.unsafeMetadata?.accountType as AccountType) || 'individual',
    verification_status: (user.unsafeMetadata?.verificationStatus as 'pending' | 'approved' | 'rejected' | 'incomplete') || 'incomplete',
    created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    updated_at: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
  }

  const accountType: AccountType = (user.unsafeMetadata?.accountType as AccountType) || 'individual'

  // Show mobile logged-in view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white pt-16 lg:pt-0">
        <ProfileMobileNew />
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        .profile-layout-wrapper {
          --navbar-bg: rgb(249, 250, 251);
          --navbar-border: rgb(229, 231, 235);
        }
        
        .dark .profile-layout-wrapper {
          --navbar-bg: rgb(17, 24, 39);
          --navbar-border: rgb(55, 65, 81);
        }
        
        /* Target the main desktop navbar */
        body:has(.profile-layout-wrapper) > div > div > nav,
        body:has(.profile-layout-wrapper) > div > nav {
          background-color: var(--navbar-bg) !important;
          border-bottom-color: var(--navbar-border) !important;
        }
        
        /* Footer only in main content area, not under sidebar */
        body:has(.profile-layout-wrapper) footer {
          margin-left: 16rem !important; /* 256px = w-64 */
        }
        
        @media (max-width: 1024px) {
          body:has(.profile-layout-wrapper) footer {
            margin-left: 0 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 profile-layout-wrapper">
        {/* Full Header - Always Visible - Part of Background */}
        <ProfileTopbar user={userProfile} accountType={accountType} />

        <div className="flex">
          {/* Background Sidebar - Fixed - Part of Background */}
          <ProfileSidebarWrapper
            user={userProfile}
            accountType={accountType}
            verificationStatus={userProfile.verification_status}
            className="fixed top-16 left-0 bottom-0 z-10 w-64"
          />

          {/* Main Content Area - Starts after sidebar */}
          <div className="flex-1 lg:ml-64">
            <main className="py-6 px-4 sm:px-6 lg:px-8">
              {/* ONE BIG WHITE FLOATING CARD - Alibaba Style */}
              <div className="mx-auto max-w-7xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Content inside card */}
                  <div className="p-6 sm:p-8 lg:p-10">
                    {children}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
