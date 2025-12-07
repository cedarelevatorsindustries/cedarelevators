"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getNavbarVariant, mergeNavbarConfig, type NavbarConfig } from "../../desktop/navbar/config"
import { NavItem } from "./components/nav-item"
import { navItems, getQuoteTabLabel } from "./components/nav-items-config"

interface MobileBottomNavigationProps {
  className?: string
  customConfig?: Partial<NavbarConfig>
}

export default function MobileBottomNavigation({ className = "", customConfig }: MobileBottomNavigationProps) {
  const pathname = usePathname()
  const [quoteLabel, setQuoteLabel] = useState("Quote")
  
  // Get variant-based configuration
  const variant = getNavbarVariant(pathname)
  const config = mergeNavbarConfig(variant, customConfig)
  
  // Fetch user type and update quote label
  useEffect(() => {
    async function fetchUserType() {
      try {
        const response = await fetch('/api/auth/user-type')
        const data = await response.json()
        setQuoteLabel(getQuoteTabLabel(data.userType || 'guest'))
      } catch (error) {
        setQuoteLabel(getQuoteTabLabel('guest'))
      }
    }
    fetchUserType()
  }, [])
  
  // Hide bottom nav if config says so (e.g., checkout page)
  if (!config.mobile.showBottomNav) {
    return null
  }
  
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 ${className}`}>
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.href === "/request-quote" ? quoteLabel : item.label}
            isActive={isActive(item.href)}
          />
        ))}
      </div>
    </div>
  )
}
