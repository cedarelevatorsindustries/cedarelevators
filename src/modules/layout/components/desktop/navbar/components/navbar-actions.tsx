"use client"

import Link from "next/link"
import { FileText, Phone, Shield } from "lucide-react"
import { useUser } from "@/lib/auth/client"
import type { NavbarConfig } from "../config"

interface NavbarActionsProps {
  config?: NavbarConfig
  isTransparent?: boolean
  pathname?: string
  isScrolled?: boolean
}

export function NavbarActions({}: NavbarActionsProps = {}) {
  const { user, isLoaded } = useUser()

  return (
    <div className="flex items-center gap-3 mr-2">
      {/* Contact Quick Link */}
      <Link
        href="/contact"
        className="hidden lg:flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-black/5"
      >
        <Phone size={16} />
        <span>Contact</span>
      </Link>

      {/* Primary Action: Request a Quote (Phase 1 Conversion Engine) */}
      <Link
        href="/quotes/new"
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow"
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
