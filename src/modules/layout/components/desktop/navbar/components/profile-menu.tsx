"use client"

import { useState, useEffect, useRef } from "react"
import { User, FileText, Settings, LogOut } from "lucide-react"
import { useClerk, useUser } from "@clerk/nextjs"
import LocalizedClientLink from "@/components/ui/localized-client-link"
import Image from "next/image"

interface ProfileMenuProps {
  isTransparent: boolean
  onHover?: () => void
}

export function ProfileMenu({ isTransparent, onHover }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { signOut } = useClerk()
  const { user } = useUser()

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (onHover) onHover()
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const avatarUrl = user?.imageUrl
  const userName = user?.fullName || user?.firstName || "User"

  return (
    <div 
      className="relative" 
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="User menu"
        aria-expanded={isOpen}
        style={{
          borderColor: isTransparent ? 'rgba(255, 255, 255, 0.5)' : '#e5e7eb'
        }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={userName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 z-50">
          {/* Arrow/Tail */}
          <div className="absolute right-2 -top-2">
            <div className="w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 shadow-lg" />
          </div>
          
          {/* Card content */}
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48">
            <LocalizedClientLink
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} />
              My Profile
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/orders"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FileText size={16} />
              My Orders
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} />
              Settings
            </LocalizedClientLink>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              onClick={() => {
                setIsOpen(false)
                signOut({ redirectUrl: '/sign-in' })
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
