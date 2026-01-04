"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, ChevronDown } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface DeliverToMenuProps {
  isTransparent: boolean
  onHover?: () => void
}

export function DeliverToMenu({ isTransparent, onHover }: DeliverToMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
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
        className={`flex items-center gap-2 transition-colors p-2 focus:outline-none rounded-sm ${
          isTransparent
            ? 'text-white hover:text-blue-300' 
            : 'text-gray-700 hover:text-blue-700'
        }`}
        aria-label="Delivery location"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MapPin size={18} aria-hidden="true" />
        <span className="text-sm font-medium">Deliver to:</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 z-50">
          {/* Arrow/Tail */}
          <div className="absolute right-6 -top-2">
            <div className="w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 shadow-lg" />
          </div>
          
          {/* Card content */}
          <div className="relative w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Specify your location
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Shipping options and fees vary based on your location
            </p>
            <LocalizedClientLink
              href="/account/addresses/add"
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Add address
            </LocalizedClientLink>
          </div>
        </div>
      )}
    </div>
  )
}

