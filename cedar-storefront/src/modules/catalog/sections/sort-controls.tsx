"use client"

import { Grid, List, ChevronDown } from "lucide-react"

export type SortOption = {
  id: string
  label: string
}

export type ViewMode = "grid" | "list"

interface SortControlsProps {
  totalProducts: number
  currentSort: string
  sortOptions: SortOption[]
  onSortChange: (sortId: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showViewToggle?: boolean
}

export default function SortControls({
  totalProducts,
  currentSort,
  sortOptions,
  onSortChange,
  viewMode,
  onViewModeChange,
  showViewToggle = true
}: SortControlsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{totalProducts.toLocaleString()}</span> products found
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {showViewToggle && (
            <div className="hidden md:flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                aria-label="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
