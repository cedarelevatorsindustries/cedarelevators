"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ActiveFilterChip {
  key: string
  label: string
  value: any
}

interface ActiveFilterChipsProps {
  filters: ActiveFilterChip[]
  onRemove: (key: string, value?: any) => void
  onClearAll: () => void
}

export function ActiveFilterChips({ filters, onRemove, onClearAll }: ActiveFilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Active Filters:</span>
      {filters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${index}`}
          variant="secondary"
          className="pl-3 pr-2 py-1.5 flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
        >
          <span className="text-sm">{filter.label}</span>
          <button
            onClick={() => onRemove(filter.key, filter.value)}
            className="hover:text-orange-900 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Badge>
      ))}
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          Clear All
        </Button>
      )}
    </div>
  )
}

