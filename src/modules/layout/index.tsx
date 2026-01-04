"use client"

import { useState, useEffect } from "react"
import { ProductCategory } from "@/lib/types/domain"
import { useUser } from "@clerk/nextjs"
import DesktopNavbar from "./components/desktop/navbar"
import MobileTopBar from "./components/mobile/top-bar"
import MobileBottomNavigation from "./components/mobile/bottom-nav"
import MobileSidebar from "./components/mobile/sidebar"
import type { NavbarConfig } from "./components/desktop/navbar/config"
import type { UserType } from "@/lib/auth/server"

interface LayoutProps {
  categories: ProductCategory[]
  customConfig?: Partial<NavbarConfig>
  isLoggedIn?: boolean
  userType?: UserType
  companyName?: string | null
}

export default function Layout({
  categories,
  customConfig,
  isLoggedIn = false,
  userType = "guest",
  companyName = null
}: LayoutProps) {
  const { user } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState("John Doe") // TODO: Get from user context

  const isBusiness = userType === "business"
  const customerId = user?.id || null

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Desktop Navbar */}
      <DesktopNavbar
        categories={categories}
        customConfig={customConfig}
        isLoggedIn={isLoggedIn}
      />

      {/* Mobile Top Bar */}
      <MobileTopBar
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        customConfig={customConfig}
        customerId={customerId}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation customConfig={customConfig} />

      {/* Mobile Sidebar Menu */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  )
}
