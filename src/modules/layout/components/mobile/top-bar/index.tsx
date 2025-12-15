"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { getNavbarVariant, mergeNavbarConfig, type NavbarConfig } from "../../desktop/navbar/config"
import { TopBarHeader } from "./components/top-bar-header"
import { TopBarSearch } from "./components/top-bar-search"
import { useNotifications } from "@/lib/hooks"

interface MobileTopBarProps {
  onMenuClick: () => void
  notificationCount?: number
  customConfig?: Partial<NavbarConfig>
  customerId?: string | null
}

export default function MobileTopBar({ onMenuClick, notificationCount: propNotificationCount, customConfig, customerId }: MobileTopBarProps) {
  // Real-time notifications via Pusher (only for logged-in users)
  const { unreadCount } = useNotifications({
    customerId,
    channel: customerId ? `user-${customerId}` : undefined
  })

  // Use real-time count if available, otherwise fall back to prop
  const notificationCount = customerId ? (unreadCount || propNotificationCount || 0) : 0
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  // Get variant-based configuration
  const variant = getNavbarVariant(pathname)
  const config = mergeNavbarConfig(variant, customConfig)

  useEffect(() => {
    if (config.scrollBehavior === 'static') {
      setIsScrolled(false)
      return
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > config.scrollThreshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [config.scrollBehavior, config.scrollThreshold])

  const isTransparent = config.mobile.transparentTopBar && !isScrolled
  const shouldShowHeader = config.position === 'fixed' || isScrolled

  const isPDP = pathname.startsWith('/products/') || pathname.startsWith('/p/')

  if (isPDP) {
    return null
  }

  return (
    <div
      className={`${config.position === 'absolute' ? (isScrolled ? 'fixed' : 'absolute') : 'fixed'} top-0 inset-x-0 z-50 md:hidden transition-all duration-300 ease-in-out ${shouldShowHeader ? 'translate-y-0 opacity-100' : ''
        }`}
      style={{
        height: '56px',
        zIndex: isScrolled ? 1000 : 50
      }}
    >
      <header
        className={`relative mx-auto duration-300 ease-in-out ${isTransparent
          ? 'h-16 bg-transparent border-b border-transparent'
          : 'h-[56px] bg-white border-b border-gray-200'
          }`}
      >
        <TopBarHeader
          pathname={pathname}
          onMenuClick={onMenuClick}
          notificationCount={notificationCount}
          config={config}
          isTransparent={isTransparent}
          showNotifications={!!customerId}
        />

        {(variant === 'homepage' || variant === 'category-hero' || variant === 'browse-products') && isScrolled && (
          <TopBarSearch />
        )}
      </header>
    </div>
  )
}
