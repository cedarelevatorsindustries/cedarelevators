"use client"

import { Menu, Heart, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWishlist } from "@/lib/hooks/use-wishlist"

interface TopBarHeaderProps {
  pathname: string
  onMenuClick: () => void
  shouldShowHeader?: boolean
  shouldUseFixedLayout?: boolean
  config?: any
  isTransparent?: boolean
}

export function TopBarHeader({
  pathname,
  onMenuClick,
  isTransparent = false
}: TopBarHeaderProps) {
  const router = useRouter()
  const { count } = useWishlist()

  // Define root pages where Hamburger menu is shown
  const isRootPage = [
    '/',
    '/catalog',
    '/cart',
    '/profile',
    '/account',
    '/quotes/new'
  ].includes(pathname)

  const getPageTitle = () => {
    // Homepage - Brand Name
    if (pathname === '/') return 'Cedar Elevator Industries'

    // Explicit mapping for known root pages
    if (pathname === '/catalog') return 'Catalog'
    if (pathname === '/cart') return 'Cart'
    if (pathname === '/quotes/new') return 'Quote'
    if (pathname.startsWith('/quotes/') && pathname !== '/quotes/new') return 'Quote Details'
    if (pathname === '/profile' || pathname === '/account') return 'My Cedar'
    if (pathname.startsWith('/profile/orders/') && pathname !== '/profile/orders') return 'Order Detail'

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
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-auto max-w-[70%] text-center flex justify-center">
        {pathname === '/' ? (
          <Link
            href="/"
            className={`font-bold leading-tight tracking-[-0.015em] text-sm whitespace-nowrap ${isTransparent ? 'text-white' : 'text-gray-900'
              }`}
          >
            {getPageTitle()}
          </Link>
        ) : (
          <h2 className={`font-bold leading-tight tracking-[-0.015em] truncate text-base ${isTransparent ? 'text-white' : 'text-gray-900'
            }`}>
            {getPageTitle()}
          </h2>
        )}
      </div>

      {/* Right: Icons (Wishlist Only) */}
      <div className="flex items-center justify-end gap-1">
        {/* Wishlist/Like Icon with Badge */}
        <Link
          href="/wishlist"
          className={`flex items-center justify-center h-10 w-10 transition-colors relative ${iconColorClass}`}
          aria-label="View wishlist"
        >
          <Heart size={24} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}

