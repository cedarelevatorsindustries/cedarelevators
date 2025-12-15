"use client"

import { useState, useEffect } from 'react'
import { CreditCard, Check, Plus } from 'lucide-react'
import { getSavedPaymentMethods, type SavedPaymentMethod } from '@/lib/data/payment'
import { Cart } from "@/lib/types/domain"

interface RazorpayPaymentProps {
  cart: Cart
  onPaymentMethodSelect: (methodId: string | null) => void
  onNewCardSelect: () => void
}

export default function RazorpayPayment({
  cart,
  onPaymentMethodSelect,
  onNewCardSelect,
}: RazorpayPaymentProps) {
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isUsingSavedMethod, setIsUsingSavedMethod] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock user ID fetch or passed prop
    const accountHolderId = "user_123" // TODO: Get from auth context

    if (!accountHolderId) {
      setLoading(false)
      return
    }

    getSavedPaymentMethods(accountHolderId)
      .then(({ payment_methods }) => {
        setSavedPaymentMethods(payment_methods)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const handleSelectSavedMethod = (method: SavedPaymentMethod) => {
    setSelectedPaymentMethod(method.id)
    setIsUsingSavedMethod(true)
    onPaymentMethodSelect(method.id)
  }

  const handleSelectNewCard = () => {
    setSelectedPaymentMethod(null)
    setIsUsingSavedMethod(false)
    onNewCardSelect()
  }

  const getCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      rupay: 'RuPay',
    }
    return brands[brand.toLowerCase()] || brand
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading payment methods...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Saved Payment Methods */}
      {savedPaymentMethods.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Saved Payment Methods
          </h3>
          <div className="space-y-2">
            {savedPaymentMethods.map((method) => {
              const isSelected = selectedPaymentMethod === method.id
              const cardData = method.data.card

              return (
                <button
                  key={method.id}
                  onClick={() => handleSelectSavedMethod(method)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${isSelected ? 'bg-indigo-200' : 'bg-gray-100'}
                      `}>
                        <CreditCard className={`w-5 h-5 ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        {cardData && (
                          <>
                            <div className="font-semibold text-gray-900">
                              {getCardBrand(cardData.brand)} •••• {cardData.last4}
                            </div>
                            <div className="text-sm text-gray-600">
                              Expires {cardData.exp_month}/{cardData.exp_year}
                            </div>
                          </>
                        )}
                        {method.data.wallet && (
                          <div className="font-semibold text-gray-900">
                            {method.data.wallet}
                          </div>
                        )}
                        {method.data.bank && (
                          <div className="font-semibold text-gray-900">
                            {method.data.bank}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Add New Payment Method */}
      <div>
        {savedPaymentMethods.length > 0 && (
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Or use a new payment method
          </h3>
        )}
        <button
          onClick={handleSelectNewCard}
          className={`
            w-full p-4 rounded-lg border-2 text-left transition-all
            ${!isUsingSavedMethod
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${!isUsingSavedMethod ? 'bg-indigo-200' : 'bg-gray-100'}
              `}>
                <Plus className={`w-5 h-5 ${!isUsingSavedMethod ? 'text-indigo-700' : 'text-gray-600'}`} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Add New Payment Method
                </div>
                <div className="text-sm text-gray-600">
                  Pay with UPI, Card, or NetBanking
                </div>
              </div>
            </div>
            {!isUsingSavedMethod && (
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Save for future use checkbox (only shown when adding new method) */}
      {!isUsingSavedMethod && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="save-payment-method"
            defaultChecked
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="save-payment-method" className="text-sm text-gray-700">
            Save this payment method for future purchases
          </label>
        </div>
      )}
    </div>
  )
}
