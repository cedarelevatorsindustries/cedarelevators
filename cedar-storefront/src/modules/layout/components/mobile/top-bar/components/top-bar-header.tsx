"use client"

import { Menu, Bell, Heart, ChevronLeft } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { useRouter } from "next/navigation"

interface TopBarHeaderProps {
  pathname: string
  onMenuClick: () => void
  notificationCount: number
  shouldShowHeader?: boolean
  shouldUseFixedLayout?: boolean
  config?: any
  isTransparent?: boolean
  showNotifications?: boolean
}

export function TopBarHeader({
  pathname,
  onMenuClick,
  notificationCount,
  isTransparent = false,
  showNotifications = false
}: TopBarHeaderProps) {
  const router = useRouter()

  // Define root pages where Hamburger menu is shown
  const isRootPage = [
    '/',
    '/catalog',
    '/cart',
    '/profile',
    '/account',
    '/request-quote'
  ].includes(pathname)

  const getPageTitle = () => {
    // Homepage - Brand Name
    if (pathname === '/') return 'Cedar Elevator Industries'

    // Explicit mapping for known root pages
    if (pathname === '/catalog') return 'Catalog'
    if (pathname === '/cart') return 'Cart'
    if (pathname === '/request-quote') return 'Quote'
    if (pathname === '/profile' || pathname === '/account') return 'My Cedar'

    // For other pages, format the pathname
    // Remove leading slash, split by slash, take last segment, capital case
    if (pathname) {
      const segments = pathname.split('/').filter(Boolean)
      if (segments.length > 0) {
        let title = segments[segments.length - 1]
        // Handle dynamic segments (e.g., [id]) - usually not visible in pathname but actual id is
        // Clean up title: replace hyphens with spaces, capitalize
        title = title.replace(/-/g, ' ')
        // Capitalize first letter of each word
        return title.replace(/\b\w/g, l => l.toUpperCase())
      }
    }

    return 'Cedar Elevator Industries'
  }

  // When transparent, use white text; when solid white bg, use dark text
  const iconColorClass = isTransparent
    ? 'text-white hover:text-blue-300'
    : 'text-gray-700 hover:text-blue-700'

  return (
    <nav className="flex items-center justify-between w-full h-full px-4 relative">
      {/* Left: Hamburger Menu or Back Button */}
      {isRootPage ? (
        <button
          onClick={onMenuClick}
          className={`flex items-center justify-center h-12 w-12 transition-colors ${iconColorClass}`}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      ) : (
        <button
          onClick={() => router.back()}
          className={`flex items-center justify-center h-12 w-12 transition-colors ${iconColorClass}`}
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Center: Website Title / Page Name */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 text-center flex justify-center">
        {pathname === '/' ? (
          <LocalizedClientLink
            href="/"
            className={`font-bold leading-tight tracking-[-0.015em] truncate text-lg ${isTransparent ? 'text-white' : 'text-gray-900'
              }`}
          >
            {getPageTitle()}
          </LocalizedClientLink>
        ) : (
          <h2 className={`font-bold leading-tight tracking-[-0.015em] truncate text-base ${isTransparent ? 'text-white' : 'text-gray-900'
            }`}>
            {getPageTitle()}
          </h2>
        )}
      </div>

      {/* Right: Icons (Like + Notification) */}
      <div className="flex items-center justify-end gap-1">
        {/* Wishlist/Like Icon - Always Show */}
        <LocalizedClientLink
          href="/saved"
          className={`flex items-center justify-center h-10 w-10 transition-colors ${iconColorClass}`}
          aria-label="View wishlist"
        >
          <Heart size={24} />
        </LocalizedClientLink>

        {/* Notification Icon - Only if logged in */}
        {showNotifications && (
          <LocalizedClientLink
            href="/notifications"
            className={`flex items-center justify-center h-10 w-10 relative transition-colors ${iconColorClass}`}
            aria-label="View notifications"
          >
            <Bell size={24} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </LocalizedClientLink>
        )}
      </div>
    </nav>
  )
}
