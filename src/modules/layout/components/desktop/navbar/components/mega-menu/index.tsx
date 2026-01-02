"use client"

import { useState, useEffect } from "react"
import { ProductCategory } from "@/lib/types/domain"
import { MegaMenuTrigger } from "./mega-menu-trigger"
import { MegaMenuPanel } from "./mega-menu-panel"
import { getMegaMenuData } from "@/lib/actions/mega-menu"

interface MegaMenuProps {
  categories: ProductCategory[]
  isScrolled?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export function MegaMenu({ categories: initialCategories, isScrolled = false, onOpenChange }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("")
  const [categories, setCategories] = useState<ProductCategory[]>([])

  // Always fetch categories with products on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getMegaMenuData()
        if (result.success && result.categories) {
          // The getMegaMenuData already filters categories with products
          setCategories(result.categories as ProductCategory[])

          // Set first category as active if we have categories
          if (result.categories.length > 0) {
            setActiveCategory(result.categories[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching categories for mega menu:', error)
        setCategories([])
      }
    }
    fetchCategories()
  }, []) // Empty dependency array - fetch only once on mount

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

  // Don't render if no categories
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <MegaMenuTrigger
        isScrolled={isScrolled}
        onMouseEnter={() => updateIsOpen(true)}
      />

      {isOpen && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            style={{ top: isScrolled ? '70px' : '80px' }}
            onClick={() => updateIsOpen(false)}
          />

          <MegaMenuPanel
            isScrolled={isScrolled}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onMouseEnter={() => updateIsOpen(true)}
            onMouseLeave={() => updateIsOpen(false)}
            onClose={() => updateIsOpen(false)}
            categories={categories}
          />
        </>
      )}
    </div>
  )
}
