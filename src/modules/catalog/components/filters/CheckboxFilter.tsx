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
    <div className="space-y-3">
      {visibleOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-3">
          <Checkbox
            id={`filter-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
            className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
          />
          <Label
            htmlFor={`filter-${option.value}`}
            className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
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
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2"
        >
          {showAll ? `Show Less` : `Show ${options.length - maxVisible} More`}
        </button>
      )}
    </div>
  )
}

