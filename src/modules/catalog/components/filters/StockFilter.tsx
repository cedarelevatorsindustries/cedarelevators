"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface StockFilterProps {
  selectedValue?: 'all' | 'in_stock' | 'out_of_stock'
  onChange: (value: 'all' | 'in_stock' | 'out_of_stock') => void
  counts?: {
    in_stock: number
    out_of_stock: number
  }
}

export function StockFilter({ selectedValue = 'all', onChange, counts }: StockFilterProps) {
  const options = [
    { value: 'all', label: 'All Products' },
    { value: 'in_stock', label: 'In Stock', count: counts?.in_stock },
    { value: 'out_of_stock', label: 'Out of Stock', count: counts?.out_of_stock }
  ]

  return (
    <div className="space-y-3">
      <RadioGroup value={selectedValue} onValueChange={onChange as any}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.value}
              id={`stock-${option.value}`}
              className="data-[state=checked]:border-orange-600 data-[state=checked]:text-orange-600"
            />
            <Label
              htmlFor={`stock-${option.value}`}
              className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
            >
              <span className="text-gray-700">{option.label}</span>
              {option.count !== undefined && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {option.count}
                </Badge>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
