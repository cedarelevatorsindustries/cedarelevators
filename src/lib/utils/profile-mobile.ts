import { AccountType } from '@/lib/constants/profile'

export interface MobileMenuItem {
  label: string
  icon: string
  href?: string
  onClick?: (() => void) | string
  badge?: string
  chevron?: boolean
  isLogout?: boolean
}

export interface MobileMenuSection {
  title?: string
  items: MobileMenuItem[]
}

/**
 * Get Mobile Profile Menu based on user role
 * 
 * This function returns the appropriate menu structure for mobile profile
 * following the principle: Navigation-First, NOT Data-First
 * 
 * Rules:
 * - Guest: 5 items max
 * - Individual: 11 items (8 nav + 3 support)
 * - Business Unverified: 10 items (7 nav + 3 support)
 * - Business Verified: 11 items (8 nav + 3 support)
 */
export function getMobileProfileMenu(
  accountType: AccountType,
  isVerified: boolean = false
): MobileMenuSection[] {

  // GUEST USER MENU
  if (accountType === 'guest') {
    return [
      {
        title: 'Explore', // First item now
        items: [
          { label: 'Browse Products', icon: 'Package', href: '/catalog' },
        ]
      },
      {
        title: 'Engage',
        items: [
          { label: 'Get a Quote', icon: 'FileText', href: '/quotes/new' },
          { label: 'Contact Sales / Request Callback', icon: 'Phone', href: '/contact' },
        ]
      },
      {
        title: 'Support',
        items: [
          { label: 'About Cedar', icon: 'Info', href: '/about' },
        ]
      }
    ]
  }

  // INDIVIDUAL USER MENU (11 items total)
  if (accountType === 'individual') {
    return [
      {
        title: 'Account',
        items: [
          { label: 'Profile Overview', icon: 'User', href: '/profile' },
          { label: 'Personal Info', icon: 'User', href: '/profile/personal-info' },
          { label: 'Addresses', icon: 'MapPin', href: '/profile/addresses' },
        ]
      },
      {
        title: 'Settings',
        items: [
          { label: 'Security', icon: 'Shield', href: '/profile/security' },
        ]
      },
      {
        title: 'Support & Auth',
        items: [
          { label: 'Contact Support', icon: 'Headset', href: '/contact' },
          { label: 'Logout', icon: 'LogOut', onClick: 'logout', chevron: false },
        ]
      }
    ]
  }

  // BUSINESS USER MENU (10-11 items based on verification)
  if (accountType === 'business') {
    if (!isVerified) {
      // BUSINESS UNVERIFIED
      return [
        {
          title: 'Business',
          items: [
            { label: 'Business Overview', icon: 'LayoutDashboard', href: '/profile' },
            { label: 'Addresses', icon: 'MapPin', href: '/profile/addresses' },
            { label: 'Verification', icon: 'CircleCheck', href: '/profile/approvals', badge: 'Pending' },
          ]
        },
        {
          title: 'Settings',
          items: [
            { label: 'Security', icon: 'Shield', href: '/profile/security' },
          ]
        },
        {
          title: 'Support',
          items: [
            { label: 'Contact Support', icon: 'Headset', href: '/contact' },
            { label: 'Logout', icon: 'LogOut', onClick: 'logout', chevron: false, isLogout: true },
          ]
        }
      ]
    } else {
      // BUSINESS VERIFIED
      return [
        {
          title: 'Business',
          items: [
            { label: 'Business Overview', icon: 'LayoutDashboard', href: '/profile' },
            { label: 'Addresses', icon: 'MapPin', href: '/profile/addresses' },
            { label: 'Verification', icon: 'CircleCheck', href: '/profile/approvals' },
          ]
        },
        {
          title: 'Activity',
          items: [
            { label: 'Orders', icon: 'Package', href: '/profile/orders' },
          ]
        },
        {
          title: 'Settings',
          items: [
            { label: 'Security', icon: 'Shield', href: '/profile/security' },
          ]
        },
        {
          title: 'Support',
          items: [
            { label: 'Contact Support', icon: 'Headset', href: '/contact' },
            { label: 'Logout', icon: 'LogOut', onClick: 'logout', chevron: false, isLogout: true },
          ]
        }
      ]
    }
  }

  // Fallback (should never reach here)
  return []
}

/**
 * Get account card CTA based on role and verification status
 */
export function getAccountCardCTA(accountType: AccountType, isVerified: boolean) {
  if (accountType === 'guest') {
    return {
      primary: { label: 'Sign In', href: '/sign-in' },
      secondary: { label: 'Create Account', href: '/sign-up' }
    }
  }

  if (accountType === 'individual') {
    return {
      primary: { label: 'Upgrade to Business', href: '/business-signup' }
    }
  }

  if (accountType === 'business' && !isVerified) {
    return {
      primary: { label: 'Complete Verification', href: '/profile/approvals' }
    }
  }

  // Verified business - no CTA
  return null
}

