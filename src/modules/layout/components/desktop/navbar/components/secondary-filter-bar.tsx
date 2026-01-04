"use client"

import { SlidersHorizontal, Grid3x3, List } from "lucide-react"

interface SecondaryFilterBarProps {
  isVisible: boolean
  onFilterClick?: () => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
}

export function SecondaryFilterBar({ 
  isVisible, 
  onFilterClick,
  viewMode = 'grid',
  onViewModeChange 
}: SecondaryFilterBarProps) {
  if (!isVisible) return null

  return (
    <div 
      className="hidden md:block fixed top-[70px] inset-x-0 bg-gray-50 border-b border-gray-200 transition-all duration-300"
      style={{ zIndex: 999 }}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Filter Button */}
          <button
            onClick={onFilterClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

          {/* Right: View Mode & Sort */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange?.('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => onViewModeChange?.('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
              <option>Best Selling</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

