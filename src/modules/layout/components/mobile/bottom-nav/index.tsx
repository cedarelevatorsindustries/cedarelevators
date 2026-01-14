"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from "@/lib/auth/client"
import { getNavbarVariant, mergeNavbarConfig, type NavbarConfig } from "../../desktop/navbar/config"
import { NavItem } from "./components/nav-item"
import { getFilteredNavItems, getQuoteTabLabel } from "./components/nav-items-config"
import type { UserType } from "@/types/cart.types"

interface MobileBottomNavigationProps {
  className?: string
  customConfig?: Partial<NavbarConfig>
}

export default function MobileBottomNavigation({ className = "", customConfig }: MobileBottomNavigationProps) {
  const pathname = usePathname()
  const [quoteLabel, setQuoteLabel] = useState("Quote")
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(false)

  // Get variant-based configuration
  const variant = getNavbarVariant(pathname)
  const config = mergeNavbarConfig(variant, customConfig)

  // Use enhanced auth hook for reactive updates
  const { user } = useUser()

  // Determine user type for filtering nav items
  const userType: UserType = user?.userType === 'verified' ? 'business_verified' :
    user?.userType === 'business' ? 'business_unverified' :
      user?.userType === 'individual' ? 'individual' : 'guest'

  useEffect(() => {
    if (user) {
      setQuoteLabel(getQuoteTabLabel(user.userType))

      // Show green badge only for verified business users
      if (user.userType === 'verified') {
        setShowVerifiedBadge(true)
      } else {
        setShowVerifiedBadge(false)
      }
    } else {
      setQuoteLabel(getQuoteTabLabel('guest'))
      setShowVerifiedBadge(false)
    }
  }, [user])

  // Hide bottom nav if config says so (e.g., checkout page)
  if (!config.mobile.showBottomNav) {
    return null
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Get filtered nav items based on user type
  const filteredNavItems = getFilteredNavItems(userType)

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 ${className}`}>
      <div className={`grid h-16`} style={{ gridTemplateColumns: `repeat(${filteredNavItems.length}, minmax(0, 1fr))` }}>
        {filteredNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.href === "/quotes" ? quoteLabel : item.label}
            isActive={isActive(item.href)}
            showBadge={item.href === "/quotes" && showVerifiedBadge}
          />
        ))}
      </div>
    </div>
  )
}

