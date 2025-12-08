"use client"

import { useState } from "react"

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
  onVariantChange?: (variantType: string, variantId: string) => void
}

export default function VariantSelector({ 
  variants,
  onVariantChange 
}: VariantSelectorProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  if (variants.length === 0) return null

  const handleSelect = (type: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [type]: variantId }))
    onVariantChange?.(type, variantId)
  }

  return (
    <div className="space-y-6 bg-white rounded-lg p-6">
      {variants.map((variantGroup) => (
        <div key={variantGroup.type}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {variantGroup.type}
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {variantGroup.options.map((option) => {
              const isSelected = selectedVariants[variantGroup.type] === option.id
              const isDisabled = !option.inStock

              return (
                <button
                  key={option.id}
                  onClick={() => !isDisabled && handleSelect(variantGroup.type, option.id)}
                  disabled={isDisabled}
                  className={`
                    px-6 py-3 rounded-xl font-medium text-base transition-all
                    ${isSelected 
                      ? "bg-blue-50 text-blue-600 border-2 border-blue-500" 
                      : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                    }
                    ${isDisabled 
                      ? "opacity-40 cursor-not-allowed" 
                      : "cursor-pointer"
                    }
                  `}
                >
                  {option.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
