"use client"

import { Truck, Zap, Check } from 'lucide-react'
import type { DeliveryOption } from '../types'

interface DeliveryOptionsSectionProps {
  options: DeliveryOption[]
  selectedOption?: DeliveryOption
  onSelectOption: (option: DeliveryOption) => void
  showPrices: boolean
}

const DEFAULT_OPTIONS: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Regular shipping via trusted logistics partners',
    price: 0,
    estimatedDays: '5-7 business days',
    isDefault: true,
  },
  {
    id: 'priority',
    name: 'Priority Delivery',
    description: 'Faster delivery with priority handling',
    price: 250000, // ₹2,500 in paise
    estimatedDays: '2-3 business days',
  },
]

export default function DeliveryOptionsSection({
  options = DEFAULT_OPTIONS,
  selectedOption,
  onSelectOption,
  showPrices,
}: DeliveryOptionsSectionProps) {
  const formatPrice = (amount: number) => {
    if (!showPrices) return '₹X,XXX'
    if (amount === 0) return 'FREE'
    return `₹${(amount / 100).toLocaleString('en-IN')}`
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Truck className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Delivery Options</h2>
          <p className="text-sm text-gray-500">Choose your preferred shipping method</p>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption?.id === option.id
          const Icon = option.id === 'priority' ? Zap : Truck

          return (
            <button
              key={option.id}
              onClick={() => onSelectOption(option)}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? 'bg-green-200' : 'bg-gray-100'}
                  `}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-green-700' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{option.name}</span>
                      {option.isDefault && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{option.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {option.estimatedDays}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`
                    font-bold text-lg
                    ${option.price === 0 ? 'text-green-600' : 'text-gray-900'}
                  `}>
                    {formatPrice(option.price)}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Free Shipping Notice */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          🚚 <strong>Free shipping</strong> on orders above ₹50,000
        </p>
      </div>
    </div>
  )
}

