"use client"

import { useState } from 'react'
import { CreditCard, FileText, Building, Wallet, Check, Upload, Info } from 'lucide-react'
import type { PaymentMethod } from '../types'
import type { HttpTypes } from "@medusajs/types"
import RazorpayPayment from '../components/razorpay-payment'
import { initiatePaymentSession } from '@/lib/actions/cart'

interface PaymentMethodSectionProps {
  methods: PaymentMethod[]
  selectedMethod?: PaymentMethod
  onSelectMethod: (method: PaymentMethod) => void
  onPOUpload?: (file: File) => void
  isVerifiedDealer: boolean
  cart?: HttpTypes.StoreCart
  paymentSession?: HttpTypes.StorePaymentSession
}

const DEFAULT_METHODS: PaymentMethod[] = [
  {
    id: 'credit_30_day',
    type: 'credit_30_day',
    name: '30-Day Credit',
    description: 'Pay within 30 days of delivery. Available for verified dealers.',
    isDefault: true,
    requiresVerification: true,
  },
  {
    id: 'po_upload',
    type: 'po_upload',
    name: 'Upload Purchase Order',
    description: 'Upload your company PO for order processing.',
    requiresVerification: true,
  },
  {
    id: 'razorpay',
    type: 'razorpay',
    name: 'Pay Now (UPI/Card/NetBanking)',
    description: 'Instant payment via Razorpay. UPI, Cards, NetBanking accepted.',
    requiresVerification: false,
  },
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    name: 'Bank Transfer (NEFT/RTGS)',
    description: 'Direct bank transfer. Order processed after payment confirmation.',
    requiresVerification: false,
  },
]

const METHOD_ICONS = {
  credit_30_day: CreditCard,
  po_upload: FileText,
  razorpay: Wallet,
  bank_transfer: Building,
}

export default function PaymentMethodSection({
  methods = DEFAULT_METHODS,
  selectedMethod,
  onSelectMethod,
  onPOUpload,
  isVerifiedDealer,
  cart,
  paymentSession,
}: PaymentMethodSectionProps) {
  const [poFile, setPOFile] = useState<File | null>(null)
  const [selectedSavedPaymentMethod, setSelectedSavedPaymentMethod] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPOFile(file)
      onPOUpload?.(file)
    }
  }

  const handlePaymentMethodSelect = async (methodId: string | null) => {
    if (!cart) return

    setSelectedSavedPaymentMethod(methodId)
    
    // Initiate payment session with saved payment method
    if (methodId) {
      await initiatePaymentSession(cart, {
        provider_id: "razorpay",
        payment_method_id: methodId,
      })
    }
  }

  const handleNewCardSelect = async () => {
    if (!cart) return

    setSelectedSavedPaymentMethod(null)
    
    // Initiate payment session for new payment method
    await initiatePaymentSession(cart, {
      provider_id: "razorpay",
      save_payment_method: true,
    })
  }

  const availableMethods = methods.filter(
    method => !method.requiresVerification || isVerifiedDealer
  )

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
          <p className="text-sm text-gray-500">Choose how you'd like to pay</p>
        </div>
      </div>

      <div className="space-y-3">
        {availableMethods.map((method) => {
          const isSelected = selectedMethod?.id === method.id
          const Icon = METHOD_ICONS[method.type] || CreditCard

          return (
            <div key={method.id}>
              <button
                onClick={() => onSelectMethod(method)}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${isSelected 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isSelected ? 'bg-indigo-200' : 'bg-gray-100'}
                    `}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{method.name}</span>
                        {method.isDefault && isVerifiedDealer && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{method.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>

              {/* PO Upload Section */}
              {isSelected && method.type === 'po_upload' && (
                <div className="mt-3 ml-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Upload Purchase Order</span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100
                        cursor-pointer"
                    />
                    {poFile && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ {poFile.name} uploaded
                      </p>
                    )}
                  </label>
                </div>
              )}

              {/* Razorpay Payment Methods */}
              {isSelected && method.type === 'razorpay' && cart && (
                <div className="mt-3 ml-4">
                  <RazorpayPayment
                    cart={cart}
                    paymentSession={paymentSession}
                    onPaymentMethodSelect={handlePaymentMethodSelect}
                    onNewCardSelect={handleNewCardSelect}
                  />
                </div>
              )}

              {/* Bank Transfer Details */}
              {isSelected && method.type === 'bank_transfer' && (
                <div className="mt-3 ml-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-2">Bank Details:</p>
                      <div className="space-y-1 text-blue-800">
                        <p>Account Name: <strong>Cedar Elevators Pvt Ltd</strong></p>
                        <p>Account No: <strong>1234567890123456</strong></p>
                        <p>IFSC Code: <strong>HDFC0001234</strong></p>
                        <p>Bank: <strong>HDFC Bank, Mumbai</strong></p>
                      </div>
                      <p className="mt-2 text-blue-700">
                        Please use your Order ID as payment reference.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Credit Terms Notice */}
      {isVerifiedDealer && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ As a verified dealer, you have access to <strong>30-day credit terms</strong>
          </p>
        </div>
      )}
    </div>
  )
}
