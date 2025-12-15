"use client"

import { CreditCard, FileText, Building, Wallet, Info } from 'lucide-react'

interface PaymentMethodsB2BProps {
  isVerifiedDealer: boolean
  selectedMethod?: string
  onSelectMethod: (method: string) => void
}

const PAYMENT_METHODS = [
  {
    id: 'credit_30_day',
    name: '30-Day Credit',
    description: 'Pay within 30 days of delivery',
    icon: CreditCard,
    dealerOnly: true,
    recommended: true,
  },
  {
    id: 'po_upload',
    name: 'Purchase Order',
    description: 'Upload your company PO',
    icon: FileText,
    dealerOnly: true,
  },
  {
    id: 'razorpay',
    name: 'Pay Now',
    description: 'UPI, Cards, NetBanking',
    icon: Wallet,
    dealerOnly: false,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'NEFT/RTGS/IMPS',
    icon: Building,
    dealerOnly: false,
  },
]

export default function PaymentMethodsB2B({
  isVerifiedDealer,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodsB2BProps) {
  const availableMethods = PAYMENT_METHODS.filter(
    method => !method.dealerOnly || isVerifiedDealer
  )

  return (
    <div className="space-y-3">
      {availableMethods.map((method) => {
        const Icon = method.icon
        const isSelected = selectedMethod === method.id

        return (
          <button
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4
              ${isSelected 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${isSelected ? 'bg-blue-200' : 'bg-gray-100'}
            `}>
              <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{method.name}</span>
                {method.recommended && isVerifiedDealer && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
            `}>
              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>
        )
      })}

      {/* Credit Terms Info */}
      {isVerifiedDealer && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800">
            As a verified dealer, you have access to <strong>30-day credit terms</strong> with 
            a credit limit of ₹10,00,000.
          </p>
        </div>
      )}
    </div>
  )
}
