'use client'

import AccountCard from './account-card'
import MobileMenu from './mobile-menu'

/**
 * Guest User Mobile Profile
 * 
 * Simple menu for non-authenticated users:
 * - Account card with Sign In/Create Account CTAs
 * - Browse Products
 * - Contact Sales
 * - Help Center
 * 
 * Total: 5 items (as per spec)
 */
export default function GuestMenu() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <AccountCard accountType="guest" />
      <MobileMenu accountType="guest" />
    </div>
  )
}

