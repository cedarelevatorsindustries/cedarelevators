"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { useUser } from "@clerk/nextjs"
import DesktopNavbar from "./components/desktop/navbar"
import MobileTopBar from "./components/mobile/top-bar"
import MobileBottomNavigation from "./components/mobile/bottom-nav"
import MobileSidebar from "./components/mobile/sidebar"
import NotificationSidebar from "./components/desktop/notification-sidebar"
import { NotificationSidebarProvider, useNotificationSidebar } from "@/lib/context/notification-sidebar-context"
import type { NavbarConfig } from "./components/desktop/navbar/config"
import type { UserType } from "@/lib/auth/server"

interface LayoutProps {
  regions: HttpTypes.StoreRegion[]
  categories: HttpTypes.StoreProductCategory[]
  customConfig?: Partial<NavbarConfig>
  isLoggedIn?: boolean
  userType?: UserType
  companyName?: string | null
}

function LayoutContent({ 
  regions, 
  categories, 
  customConfig, 
  isLoggedIn = false,
  userType = "guest",
  companyName = null
}: LayoutProps) {
  const { user } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState("John Doe") // TODO: Get from user context
  const [notificationCount, setNotificationCount] = useState(3)
  const { isOpen: isNotificationOpen, closeSidebar } = useNotificationSidebar()
  
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
        regions={regions} 
        categories={categories}
        customConfig={customConfig}
        isLoggedIn={isLoggedIn}
      />

      {/* Mobile Top Bar */}
      <MobileTopBar 
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        notificationCount={notificationCount}
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

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={isNotificationOpen}
        onClose={closeSidebar}
        userId={user?.id}
      />
    </>
  )
}

export default function Layout(props: LayoutProps) {
  return (
    <NotificationSidebarProvider>
      <LayoutContent {...props} />
    </NotificationSidebarProvider>
  )
}
