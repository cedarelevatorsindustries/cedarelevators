"use client"

import { useState } from "react"
import { Check } from "lucide-react"

interface Variant {
  id: string
  name: string
  value: string
  inStock: boolean
}

interface VariantSelectorProps {
  variants: {
    type: string
    options: Variant[]
  }[]
  selectedVariantTitle?: string
  onVariantChange?: (variantType: string, variantId: string) => void
}

export default function VariantSelector({
  variants,
  selectedVariantTitle,
  onVariantChange
}: VariantSelectorProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  if (variants.length === 0) return null

  const handleSelect = (type: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [type]: variantId }))
    onVariantChange?.(type, variantId)
  }

  // Check if all variants are selected
  const allSelected = variants.every(vg => selectedVariants[vg.type])

  return (
    <div className="space-y-6 bg-white rounded-lg p-6">
      {variants.map((variantGroup) => (
        <div key={variantGroup.type}>
          <h3 className="text-xs font-bold text-gray-900 tracking-wide uppercase mb-3">
            {variantGroup.type}
          </h3>

          <div className="flex flex-wrap gap-2">
            {variantGroup.options.map((option) => {
              const isSelected = selectedVariants[variantGroup.type] === option.id
              const isDisabled = !option.inStock

              return (
                <button
                  key={option.id}
                  onClick={() => !isDisabled && handleSelect(variantGroup.type, option.id)}
                  disabled={isDisabled}
                  className={`
                    relative px-5 py-2.5 rounded-full font-medium text-sm transition-all
                    ${isSelected
                      ? "bg-blue-50/80 backdrop-blur-sm text-blue-600 border-2 border-blue-600"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400"
                    }
                    ${isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer"
                    }
                  `}
                >
                  {isSelected && (
                    <Check className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span className={isSelected ? "ml-3" : ""}>{option.value}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Display selected variant title */}
      {allSelected && selectedVariantTitle && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">Selected Variant:</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{selectedVariantTitle}</p>
        </div>
      )}
    </div>
  )
}

