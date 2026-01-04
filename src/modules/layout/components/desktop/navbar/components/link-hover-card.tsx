"use client"

import { useState, useRef, useEffect, ReactNode } from "react"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface LinkHoverCardProps {
  href: string
  icon: ReactNode
  label: string
  text?: string
  isTransparent: boolean
  children: ReactNode | ((closeCard: () => void) => ReactNode)
  badge?: number
  badgeColor?: string
  onHover?: () => void
}

export function LinkHoverCard({ 
  href, 
  icon, 
  label, 
  text,
  isTransparent, 
  children, 
  badge,
  badgeColor = "bg-blue-600",
  onHover
}: LinkHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (onHover) onHover()
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  const closeCard = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const iconClass = isTransparent
    ? "text-white hover:text-blue-300"
    : "text-gray-700 hover:text-blue-700"

  return (
    <div 
      className="relative" 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <LocalizedClientLink
        href={href}
        className={`relative flex items-center gap-2 transition-colors ${iconClass}`}
        aria-label={label}
      >
        <div className="relative">
          {icon}
          {badge !== undefined && badge > 0 && (
            <span className={`absolute -top-2 -right-2 ${badgeColor} text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center`}>
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        {text && <span className="text-sm font-medium">{text}</span>}
      </LocalizedClientLink>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 z-50">
          {/* Arrow/Tail - position based on whether there's text */}
          <div className={`absolute -top-2 ${text ? 'right-8' : 'right-2'}`}>
            <div className="w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 shadow-lg" />
          </div>
          
          {/* Card content */}
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg">
            {typeof children === 'function' ? children(closeCard) : children}
          </div>
        </div>
      )}
    </div>
  )
}

