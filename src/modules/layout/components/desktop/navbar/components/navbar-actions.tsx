"use client"

import Link from "next/link"
import { Bookmark, FileText, Phone, Shield } from "lucide-react"
import { useUser } from "@/lib/auth/client"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import type { NavbarConfig } from "../config"

interface NavbarActionsProps {
  config?: NavbarConfig
  isTransparent?: boolean
  pathname?: string
  isScrolled?: boolean
}

export function NavbarActions({}: NavbarActionsProps = {}) {
  const { user, isLoaded } = useUser()
  const { count } = useWishlist()

  return (
    <div className="flex items-center gap-3 mr-2">
      {/* Contact Quick Link */}
      <Link
        href="/contact"
        className="type-nav hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-black/5"
      >
        <Phone size={16} />
        <span>Contact</span>
      </Link>

      {/* Quote List Link */}
      <Link
        href="/wishlist"
        className="type-nav relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-black/5"
        title="Quote List"
        aria-label="Quote List"
      >
        <Bookmark size={16} />
        <span>Quote List</span>
        {count > 0 && (
          <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-medium rounded-full bg-orange-600 text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>

      {/* Primary Action: Request a Quote (Phase 1 Conversion Engine) */}
      <Link
        href="/quotes/new"
        className="type-button flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-lg shadow-sm transition-all hover:shadow"
      >
        <FileText size={16} />
        <span>Request a Quote</span>
      </Link>

      {/* Admin Quick Access Pill (Visible only to authenticated staff) */}
      {isLoaded && user && (
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors"
          title="Open Admin Dashboard"
        >
          <Shield size={14} className="text-orange-400" />
          <span>Admin</span>
        </Link>
      )}
    </div>
  )
}
