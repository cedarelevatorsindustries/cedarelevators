"use client"

import { useRef } from "react"
import { CategorySidebar } from "./category-sidebar"
import { CategoryContent } from "./category-content"
import { ProductCategory } from "@/lib/types/domain"

interface MegaMenuPanelProps {
  isScrolled: boolean
  activeCategory: string
  setActiveCategory: (id: string) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClose: () => void
  categories: ProductCategory[] // Now passed as prop from parent
}

export function MegaMenuPanel({
  isScrolled,
  activeCategory,
  setActiveCategory,
  onMouseEnter,
  onMouseLeave,
  onClose,
  categories
}: MegaMenuPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const leftSidebarRef = useRef<HTMLDivElement | null>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const categoryButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const isScrollingProgrammatically = useRef(false)

  // Don't render if no categories
  if (!categories || categories.length === 0) {
    return null
  }

  // Spy scrolling: Update active category based on scroll position
  const handleRightPanelScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    // Don't update active category if user clicked a category (programmatic scroll)
    if (!isScrollingProgrammatically.current) {
      // Find which category section is currently in view
      let newActiveCategory = activeCategory
      let minDistance = Infinity

      categories.forEach((category) => {
        const element = categoryRefs.current[category.id]
        if (element) {
          const rect = element.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()

          // Calculate distance from top of container
          const distance = Math.abs(rect.top - containerRect.top)

          // If this section is closer to the top, make it active
          if (distance < minDistance && rect.top <= containerRect.top + 100) {
            minDistance = distance
            newActiveCategory = category.id
          }
        }
      })

      if (newActiveCategory !== activeCategory) {
        setActiveCategory(newActiveCategory)

        // Scroll the left sidebar to show the active category button
        const activeButton = categoryButtonRefs.current[newActiveCategory]
        if (activeButton && leftSidebarRef.current) {
          const buttonTop = activeButton.offsetTop
          const sidebarScrollTop = leftSidebarRef.current.scrollTop
          const sidebarHeight = leftSidebarRef.current.clientHeight

          // Scroll sidebar if button is not fully visible
          if (buttonTop < sidebarScrollTop || buttonTop > sidebarScrollTop + sidebarHeight - 100) {
            leftSidebarRef.current.scrollTo({
              top: buttonTop - 100,
              behavior: 'smooth'
            })
          }
        }
      }
    }

    // Close menu when scrolled to bottom (only on user scroll, not programmatic)
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
    if (isAtBottom && !isScrollingProgrammatically.current) {
      setTimeout(() => {
        onClose()
      }, 300)
    }
  }

  return (
    <div
      className="fixed left-0 w-full bg-white shadow-2xl z-50 animate-fade-in-up"
      style={{
        height: '60vh',
        top: isScrolled ? '70px' : '80px'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex h-full">
        <CategorySidebar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          leftSidebarRef={leftSidebarRef}
          categoryButtonRefs={categoryButtonRefs}
          scrollContainerRef={scrollContainerRef}
          categoryRefs={categoryRefs}
          isScrollingProgrammatically={isScrollingProgrammatically}
          categories={categories}
        />

        <CategoryContent
          scrollContainerRef={scrollContainerRef}
          categoryRefs={categoryRefs}
          onScroll={handleRightPanelScroll}
          onClose={onClose}
          categories={categories}
        />
      </div>
    </div>
  )
}

