"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, ChevronDown } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { useDefaultAddress } from "@/lib/hooks/use-default-address"

interface DeliverToMenuProps {
  isTransparent: boolean
  onHover?: () => void
}

export function DeliverToMenu({ isTransparent, onHover }: DeliverToMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { defaultAddress, isLoading } = useDefaultAddress()

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

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-2 transition-colors p-2 focus:outline-none rounded-sm ${isTransparent
          ? 'text-white hover:text-blue-300'
          : 'text-gray-700 hover:text-blue-700'
          }`}
        aria-label="Delivery location"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MapPin size={18} aria-hidden="true" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">Deliver to:</span>
          {!isLoading && defaultAddress ? (
            <span className="text-sm font-semibold">
              {defaultAddress.city}, {defaultAddress.postal_code}
            </span>
          ) : (
            <span className="text-sm font-semibold">Select address</span>
          )}
        </div>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 z-50">
          {/* Arrow/Tail */}
          <div className="absolute right-6 -top-2">
            <div className="w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 shadow-lg" />
          </div>

          {/* Card content */}
          <div className="relative w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
            {defaultAddress ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delivering to
                </h3>
                <div className="text-sm text-gray-600 mb-4">
                  <p className="font-medium text-gray-900">{defaultAddress.address_line_1}</p>
                  <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}</p>
                </div>
                <LocalizedClientLink
                  href="/profile/addresses"
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Manage Addresses
                </LocalizedClientLink>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Specify your location
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Shipping options and fees vary based on your location
                </p>
                <LocalizedClientLink
                  href="/profile/addresses"
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Add address
                </LocalizedClientLink>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
