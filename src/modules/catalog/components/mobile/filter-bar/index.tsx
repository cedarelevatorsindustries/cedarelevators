"use client"

import { SlidersHorizontal, ArrowUpDown } from "lucide-react"

interface FilterBarProps {
  onFilterClick: () => void
  onSortClick: () => void
}

export default function FilterBar({ onFilterClick, onSortClick }: FilterBarProps) {
  return (
    <div className="sticky top-[105px] z-20 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex gap-3">
        <button
          onClick={onFilterClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        >
          <SlidersHorizontal size={16} />
          Filter
        </button>
        <button
          onClick={onSortClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        >
          <ArrowUpDown size={16} />
          Sort
        </button>
      </div>
    </div>
  )
}

