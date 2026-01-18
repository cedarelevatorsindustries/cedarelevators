"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { EllipsisVertical } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { guestMoreMenuItems, loggedInMoreMenuItems, type MenuItem } from "../../../common"

interface MoreMenuProps {
  isLoggedIn: boolean
  isTransparent: boolean
  isScrolled?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MoreMenu({ isLoggedIn, isTransparent, isScrolled = false, isOpen: controlledIsOpen, onOpenChange }: MoreMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open)
    } else {
      setInternalIsOpen(open)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Always show all menu items including Contact and Help Center
  const menuItems = isLoggedIn ? loggedInMoreMenuItems : guestMoreMenuItems

  const handleMenuClick = (e: React.MouseEvent, item: MenuItem) => {
    // If "About Us" is clicked and we're on the homepage, scroll to the about section
    if (item.label === "About Us" && pathname === "/") {
      e.preventDefault()
      const aboutSection = document.getElementById("about-section")
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 transition-colors focus:outline-none rounded-sm ${isTransparent
          ? 'text-white hover:text-blue-300'
          : 'text-gray-700 hover:text-blue-700'
          }`}
        aria-label={isOpen ? "Close more menu" : "Open more menu"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <EllipsisVertical size={20} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          {/* Card content - no arrow pointer */}
          <div className="relative w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
            {menuItems.map((item) => (
              <LocalizedClientLink
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={(e) => handleMenuClick(e, item)}
              >
                <item.icon size={16} />
                {item.label}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

