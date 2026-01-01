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
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories)

  // Fetch categories on mount if not provided or empty
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      const fetchCategories = async () => {
        try {
          if (result.success && result.categories) {
            // Filter out categories with no products
            const categoriesWithProducts = (result.categories as ProductCategory[]).filter(
              cat => cat.products && cat.products.length > 0
            )
            setCategories(categoriesWithProducts)
          }
        } catch (error) {
          console.error('Error fetching categories for mega menu:', error)
          setCategories([])
        }
      }
      fetchCategories()
    }
  }, [initialCategories])

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
