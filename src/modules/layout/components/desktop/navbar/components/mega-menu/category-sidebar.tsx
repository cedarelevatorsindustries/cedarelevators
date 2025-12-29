"use client"

import { useEffect } from "react"
import { ProductCategory } from "@/lib/types/domain"
import { getCategoryIcon, getCategoryColors } from "./categories-data"

interface CategorySidebarProps {
  activeCategory: string
  setActiveCategory: (id: string) => void
  leftSidebarRef: React.RefObject<HTMLDivElement | null>
  categoryButtonRefs: React.MutableRefObject<{ [key: string]: HTMLButtonElement | null }>
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  categoryRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
  isScrollingProgrammatically: React.MutableRefObject<boolean>
  categories: ProductCategory[]
}

export function CategorySidebar({
  activeCategory,
  setActiveCategory,
  leftSidebarRef,
  categoryButtonRefs,
  scrollContainerRef,
  categoryRefs,
  isScrollingProgrammatically,
  categories
}: CategorySidebarProps) {
  
  // Initialize active category
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id)
    }
  }, [activeCategory, setActiveCategory, categories])

  const handleCategoryClick = (categoryId: string) => {
    const element = categoryRefs.current[categoryId]
    if (element && scrollContainerRef.current) {
      isScrollingProgrammatically.current = true
      setActiveCategory(categoryId)
      
      const offsetTop = element.offsetTop - 24
      scrollContainerRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })

      setTimeout(() => {
        isScrollingProgrammatically.current = false
      }, 600)
    }
  }

  return (
    <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-bold text-gray-900">Browse Categories</h3>
      </div>
      <div 
        ref={leftSidebarRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="p-4 space-y-1">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.handle || category.slug || category.id)
            const isActive = activeCategory === category.id
            
            return (
              <button
                key={category.id}
                ref={(el) => { categoryButtonRefs.current[category.id] = el }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm rounded-lg transition-all duration-300 ease-in-out transform ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:scale-102'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <IconComponent size={16} className={isActive ? 'text-white' : 'text-gray-500'} />
                <span className="flex-1 font-medium">{category.name}</span>
              </button>
            )
          })}
        </div>
        <div style={{ height: '30%' }}></div>
      </div>
    </div>
  )
}
