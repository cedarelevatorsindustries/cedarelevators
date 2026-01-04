'use client'

import { useState } from 'react'
import { CreditCard, Plus, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'upi'
  last4?: string
  brand?: string
  bankName?: string
  upiId?: string
  expiryMonth?: string
  expiryYear?: string
  isDefault: boolean
}

interface PaymentMethodsSectionProps {
  accountType: 'guest' | 'individual' | 'business'
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
}

export default function PaymentMethodsSection({
  accountType,
  verificationStatus
}: PaymentMethodsSectionProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank',
      bankName: 'HDFC Bank',
      last4: '5678',
      isDefault: false
    },
    {
      id: '3',
      type: 'upi',
      upiId: 'user@paytm',
      isDefault: false
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)

  const isVerified = accountType === 'business' && verificationStatus === 'approved'

  // Only verified business accounts can access payment methods
  if (!isVerified) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <CreditCard className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Verification Required
                </h3>
                <p className="text-gray-700 mb-4">
                  Complete business verification to access payment methods and credit facilities.
                </p>
                <a
                  href="/profile/verification"
                  className="inline-block px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Complete Verification
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(methods => methods.filter(method => method.id !== id))
    }
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return '💳'
      case 'bank':
        return '🏦'
      case 'upi':
        return '📱'
      default:
        return '💰'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your saved payment methods for quick checkout
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No payment methods added
            </h3>
            <p className="text-gray-600 mb-6">
              Add a payment method for quick and secure checkout
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  method.isDefault
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getPaymentIcon(method.type)}</div>
                    <div>
                      {method.type === 'card' && (
                        <>
                          <h4 className="font-semibold text-gray-900">
                            {method.brand} •••• {method.last4}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </>
                      )}
                      {method.type === 'bank' && (
                        <>
                          <h4 className="font-semibold text-gray-900">
                            {method.bankName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Account ••••{method.last4}
                          </p>
                        </>
                      )}
                      {method.type === 'upi' && (
                        <>
                          <h4 className="font-semibold text-gray-900">UPI</h4>
                          <p className="text-sm text-gray-600">{method.upiId}</p>
                        </>
                      )}
                      {method.isDefault && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
                          <Check size={12} />
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Add Payment Method
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This is a demo. In production, integrate with payment gateway.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

