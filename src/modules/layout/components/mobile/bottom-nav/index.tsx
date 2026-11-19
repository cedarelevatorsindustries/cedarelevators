"use client"

import { usePathname } from "next/navigation"
import { getNavbarVariant, mergeNavbarConfig, type NavbarConfig } from "../../desktop/navbar/config"
import { NavItem } from "./components/nav-item"
import { getFilteredNavItems } from "./components/nav-items-config"

interface MobileBottomNavigationProps {
  className?: string
  customConfig?: Partial<NavbarConfig>
}

export default function MobileBottomNavigation({ className = "", customConfig }: MobileBottomNavigationProps) {
  const pathname = usePathname()

  // Get variant-based configuration
  const variant = getNavbarVariant(pathname)
  const config = mergeNavbarConfig(variant, customConfig)

  // Hide bottom nav if config specifies
  if (!config.mobile.showBottomNav) {
    return null
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const filteredNavItems = getFilteredNavItems()

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 ${className}`}>
      <div className={`grid h-16`} style={{ gridTemplateColumns: `repeat(${filteredNavItems.length}, minmax(0, 1fr))` }}>
        {filteredNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.href)}
          />
        ))}
      </div>
    </div>
  )
}
