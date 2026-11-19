"use client"

import Image from "next/image"
import Link from "next/link"
import { FileText, Phone, Shield } from "lucide-react"
import { useUser } from "@/lib/auth/client"

interface SidebarHeaderProps {
  isLoggedIn: boolean
  userName: string
  onClose: () => void
}

export function SidebarHeader({ onClose }: SidebarHeaderProps) {
  const { user, isLoaded } = useUser()

  return (
    <div className="px-4 py-4 bg-orange-50 border-b border-orange-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/CEIicon.png"
            alt="Cedar Elevators"
            width={32}
            height={32}
            className="w-8 h-8 rounded"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Cedar Elevators</h3>
            <p className="text-xs text-gray-500">Premium Elevator Solutions</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Link
          href="/quotes/new"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-md transition-colors"
        >
          <FileText size={14} />
          <span>Get Quote</span>
        </Link>
        <Link
          href="/contact"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md border border-gray-200 transition-colors"
        >
          <Phone size={14} />
          <span>Contact</span>
        </Link>
      </div>

      {/* Admin Access Pill if authenticated admin */}
      {isLoaded && user && (
        <div className="mt-2 pt-2 border-t border-orange-200/50">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            <Shield size={12} className="text-orange-600" />
            <span>Open Admin Dashboard</span>
          </Link>
        </div>
      )}
    </div>
  )
}
