"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface CheckboxFilterOption {
  value: string
  label: string
  count?: number
}

interface CheckboxFilterProps {
  options: CheckboxFilterOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  maxVisible?: number
  showCount?: boolean
}

export function CheckboxFilter({
  options,
  selectedValues,
  onChange,
  maxVisible = 10,
  showCount = true
}: CheckboxFilterProps) {
  const [showAll, setShowAll] = useState(false)

  const visibleOptions = showAll ? options : options.slice(0, maxVisible)
  const hasMore = options.length > maxVisible

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    onChange(newValues)
  }

  if (options.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No options available
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {visibleOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-3 py-1">
          <Checkbox
            id={`filter-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          />
          <Label
            htmlFor={`filter-${option.value}`}
            className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between min-h-[24px]"
          >
            <span className="text-gray-700 hover:text-gray-900">
              {option.label}
            </span>
            {showCount && option.count !== undefined && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {option.count}
              </Badge>
            )}
          </Label>
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-orange-600 hover:text-orange-700 mt-2 cursor-pointer"
        >
          {showAll ? `Show Less` : `Show ${options.length - maxVisible} More`}
        </button>
      )}
    </div>
  )
}

