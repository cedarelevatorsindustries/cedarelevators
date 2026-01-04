"use client"

import { useState, useRef, useEffect, ReactNode } from "react"

interface IconHoverCardProps {
  icon: ReactNode
  label: string
  isTransparent: boolean
  children: ReactNode
  badge?: number
}

export function IconHoverCard({ icon, label, isTransparent, children, badge }: IconHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
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
      <button
        className={`relative transition-colors p-2 ${iconClass}`}
        aria-label={label}
        aria-expanded={isOpen}
      >
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 z-50">
          {/* Arrow/Tail */}
          <div className="absolute right-6 -top-2">
            <div className="w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 shadow-lg" />
          </div>
          
          {/* Card content */}
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

