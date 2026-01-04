"use client"

import { useState } from "react"
import { Check } from "lucide-react"

interface Variant {
  id: string
  name: string
  value: string
  inStock: boolean
}

interface VariantsSelectorSectionProps {
  variants: {
    type: string
    options: Variant[]
  }[]
  onVariantChange?: (variantType: string, variantId: string) => void
}

export default function VariantsSelectorSection({ 
  variants,
  onVariantChange 
}: VariantsSelectorSectionProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  if (variants.length === 0) return null

  const handleSelect = (type: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [type]: variantId }))
    onVariantChange?.(type, variantId)
  }

  return (
    <div className="space-y-6">
      {variants.map((variantGroup) => (
        <div key={variantGroup.type}>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            {variantGroup.type}
          </label>
          
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
                    relative px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all
                    ${isSelected 
                      ? "border-blue-600 bg-blue-50 text-blue-700" 
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }
                    ${isDisabled 
                      ? "opacity-50 cursor-not-allowed" 
                      : "cursor-pointer"
                    }
                  `}
                >
                  {option.value}
                  {isSelected && (
                    <Check className="absolute -top-1 -right-1 w-4 h-4 text-blue-600 bg-white rounded-full" />
                  )}
                  {isDisabled && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-0.5 bg-gray-400 rotate-45" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

