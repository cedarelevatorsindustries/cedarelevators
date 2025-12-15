"use client"

import { Grid, List, ChevronDown } from "lucide-react"
import { useState } from "react"

interface ResultsHeaderProps {
  totalProducts: number
  filteredProducts?: number
  currentView: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
  onSortChange?: (sort: string) => void
  onPerPageChange?: (perPage: number) => void
  currentPage?: number
  activeFiltersCount?: number
}

const sortOptions = [
  { value: "best-selling", label: "Best Selling" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "a-z", label: "A-Z" },
]

export default function ResultsHeader({
  totalProducts,
  filteredProducts,
  currentView,
  onViewChange,
  onSortChange,
  onPerPageChange,
  currentPage = 1,
  activeFiltersCount = 0,
}: ResultsHeaderProps) {
  const [sortBy, setSortBy] = useState("best-selling")
  const [perPage, setPerPage] = useState(24)

  const displayedProducts = filteredProducts ?? totalProducts
  const startIndex = (currentPage - 1) * perPage + 1
  const endIndex = Math.min(currentPage * perPage, displayedProducts)

  const handleSortChange = (value: string) => {
    setSortBy(value)
    onSortChange?.(value)
  }

  const handlePerPageChange = (value: number) => {
    setPerPage(value)
    onPerPageChange?.(value)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-shrink-0">
          <p className="text-lg font-bold text-gray-900">
            Showing {startIndex}-{endIndex} of{" "}
            <span className="text-orange-600">{displayedProducts}</span> products
          </p>
          {activeFiltersCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Sort by:</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer min-w-[180px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Show:</label>
            <div className="relative">
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewChange("grid")}
              className={`p-2.5 transition-all ${currentView === "grid" ? "bg-orange-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewChange("list")}
              className={`p-2.5 transition-all ${currentView === "list" ? "bg-orange-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
