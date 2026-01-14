'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import ProfileTopbar from '@/modules/profile/components/profile-topbar'
import ProfileMobileNew from '@/modules/profile/templates/profile-mobile-template'
import MobileBottomNavigation from '@/modules/layout/components/mobile/bottom-nav'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type AccountType = 'individual' | 'business'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
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
        <div className="min-h-screen bg-white pt-16 lg:pt-0 pb-16">
          <ProfileMobileNew />
          <MobileBottomNavigation />
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

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const isOverview = searchParams.get('view') === 'overview'

  // Show mobile logged-in view
  if (isMobile) {
    // If on main profile page without overview param, show menu
    if (pathname === '/profile' && !isOverview) {
      return (
        <div className="min-h-screen bg-white pt-16 lg:pt-0 pb-16">
          <ProfileMobileNew />
          <MobileBottomNavigation />
        </div>
      )
    }

    // If on sub-route OR main profile with overview param, show page content
    return (
      <div className="min-h-screen bg-white pt-16 lg:pt-0 pb-16">
        {/* Page Content */}
        <div className="p-4">
          {pathname === '/profile' && isOverview && (
            <div className="mb-4">
              <Link href="/profile" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Menu
              </Link>
            </div>
          )}
          {children}
        </div>
        <MobileBottomNavigation />
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
      `}</style>

      <div className="min-h-screen bg-gray-50 profile-layout-wrapper">
        {/* Full Header - Always Visible */}
        <ProfileTopbar user={userProfile} accountType={accountType} />

        {/* Main Content Area - Full Width */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}

