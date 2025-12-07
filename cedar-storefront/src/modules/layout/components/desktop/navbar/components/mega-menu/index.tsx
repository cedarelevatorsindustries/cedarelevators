"use client"

import { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { MegaMenuTrigger } from "./mega-menu-trigger"
import { MegaMenuPanel } from "./mega-menu-panel"

interface MegaMenuProps {
  categories: HttpTypes.StoreProductCategory[]
  isScrolled?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export function MegaMenu({ categories, isScrolled = false, onOpenChange }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("")
  
  const updateIsOpen = (newIsOpen: boolean) => {
    setIsOpen(newIsOpen)
    onOpenChange?.(newIsOpen)
  }

  // Global scroll listener to close megamenu when scrolling main page
  useEffect(() => {
    if (!isOpen) return

    const handleGlobalScroll = () => {
      updateIsOpen(false)
    }

    window.addEventListener('scroll', handleGlobalScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleGlobalScroll)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <MegaMenuTrigger 
        isScrolled={isScrolled}
        onMouseEnter={() => updateIsOpen(true)}
      />
      
      {isOpen && (
        <MegaMenuPanel
          isScrolled={isScrolled}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onMouseEnter={() => updateIsOpen(true)}
          onMouseLeave={() => updateIsOpen(false)}
          onClose={() => updateIsOpen(false)}
        />
      )}
    </div>
  )
}
