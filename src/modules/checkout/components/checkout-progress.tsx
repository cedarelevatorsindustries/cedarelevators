/**
 * Checkout Progress Indicator
 */

'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type CheckoutStep = 'address' | 'review' | 'payment'

interface CheckoutProgressProps {
  currentStep: CheckoutStep
}

const steps = [
  { id: 'address', label: 'Delivery Address', number: 1 },
  { id: 'review', label: 'Review Order', number: 2 },
  { id: 'payment', label: 'Payment', number: 3 },
]

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" data-testid="checkout-progress">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = step.id === currentStep
          const isUpcoming = index > currentIndex

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                    isCompleted && 'bg-green-600 text-white',
                    isCurrent && 'bg-orange-600 text-white',
                    isUpcoming && 'bg-gray-200 text-gray-500'
                  )}
                  data-testid={`step-${step.id}`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium whitespace-nowrap',
                    isCurrent && 'text-orange-600',
                    isCompleted && 'text-green-600',
                    isUpcoming && 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
