"use client"

import { Check } from 'lucide-react'
import type { CheckoutStep } from '../types'

interface ProgressBarSectionProps {
  currentStep: CheckoutStep
  userType: 'guest' | 'individual' | 'business_unverified' | 'business_verified'
}

const STEPS = [
  { id: 'shipping', label: 'Shipping', number: 1 },
  { id: 'payment', label: 'Payment', number: 2 },
  { id: 'review', label: 'Review', number: 3 },
  { id: 'confirmation', label: 'Confirm', number: 4 },
]

export default function ProgressBarSection({ currentStep, userType }: ProgressBarSectionProps) {
  // Don't show progress bar for blocked states
  if (currentStep === 'email_capture' || currentStep === 'blocked') {
    return null
  }

  const getCurrentStepIndex = () => {
    return STEPS.findIndex(s => s.id === currentStep)
  }

  const currentIndex = getCurrentStepIndex()

  return (
    <div className="w-full py-6 px-4 bg-white border-b">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            const isUpcoming = index > currentIndex

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span 
                    className={`
                      mt-2 text-xs font-medium
                      ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div 
                    className={`
                      flex-1 h-1 mx-2 rounded-full transition-all duration-300
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
