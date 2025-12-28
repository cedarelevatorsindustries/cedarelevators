import { AccountType } from '@/lib/constants/profile'

export interface MobileMenuItem {
  label: string
  icon: string
  href?: string
  onClick?: () => void
  badge?: string
  chevron?: boolean
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
  
  // GUEST USER MENU (5 items total)
  if (accountType === 'guest') {
    return [
      {
        items: [
          { label: 'Browse Products', icon: 'Package', href: '/catalog' },
        ]
      },
      {
        title: 'Support',
        items: [
          { label: 'Contact Sales', icon: 'Phone', href: '/contact' },
          { label: 'Help Center', icon: 'HelpCircle', href: '/help' },
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
        title: 'Activity',
        items: [
          { label: 'Quotes', icon: 'FileText', href: '/profile/quotes' },
          { label: 'Orders', icon: 'Package', href: '/profile/order-history' },
          { label: 'Wishlist', icon: 'Heart', href: '/wishlist' },
        ]
      },
      {
        title: 'Settings',
        items: [
          { label: 'Notifications', icon: 'Bell', href: '/profile/notifications' },
          { label: 'Security', icon: 'Shield', href: '/profile/security' },
        ]
      },
      {
        title: 'Support & Auth',
        items: [
          { label: 'Help Center', icon: 'HelpCircle', href: '/help' },
          { label: 'Contact Support', icon: 'Headset', href: '/contact' },
          { label: 'Logout', icon: 'LogOut', onClick: 'logout', chevron: false },
        ]
      }
    ]
  }
  
  // BUSINESS USER MENU (10-11 items based on verification)
  if (accountType === 'business') {
    if (!isVerified) {
      // BUSINESS UNVERIFIED (10 items)
      return [
        {
          title: 'Account',
          items: [
            { label: 'Business Info', icon: 'Building2', href: '/profile/business-info' },
            { label: 'Verification', icon: 'CheckCircle', href: '/profile/approvals', badge: 'Pending' },
            { label: 'Addresses', icon: 'MapPin', href: '/profile/addresses' },
          ]
        },
        {
          title: 'Activity',
          items: [
            { label: 'Quotes', icon: 'FileText', href: '/profile/quotes' },
            { label: 'Orders', icon: 'Package', href: '/profile/order-history' },
          ]
        },
        {
          title: 'Settings',
          items: [
            { label: 'Notifications', icon: 'Bell', href: '/profile/notifications' },
            { label: 'Security', icon: 'Shield', href: '/profile/security' },
          ]
        },
        {
          title: 'Support & Auth',
          items: [
            { label: 'Help Center', icon: 'HelpCircle', href: '/help' },
            { label: 'Contact Support', icon: 'Headset', href: '/contact' },
            { label: 'Logout', icon: 'LogOut', onClick: 'logout', chevron: false },
          ]
        }
      ]
    } else {
      // BUSINESS VERIFIED (11 items)
      return [
        {
          title: 'Account',
          items: [
            { label: 'Business Info', icon: 'Building2', href: '/profile/business-info' },
            { label: 'Addresses', icon: 'MapPin', href: '/profile/addresses' },
            { label: 'Payment Preferences', icon: 'CreditCard', href: '/profile/payment-methods' },
          ]
        },
        {
          title: 'Activity',
          items: [
            { label: 'Quotes', icon: 'FileText', href: '/profile/quotes' },
            { label: 'Orders', icon: 'Package', href: '/profile/order-history' },
            { label: 'Invoices', icon: 'FileText', href: '/profile/invoices' },
          ]
        },
        {
          title: 'Settings',
          items: [
            { label: 'Notifications', icon: 'Bell', href: '/profile/notifications' },
            { label: 'Security', icon: 'Shield', href: '/profile/security' },
          ]
        },
        {
          title: 'Support & Auth',
          items: [
            { label: 'Help Center', icon: 'HelpCircle', href: '/help' },
            { label: 'Contact Support', icon: 'Headset', href: '/contact' },
            { label: 'Logout', icon: 'LogOut', onClick: 'logout', chevron: false },
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
