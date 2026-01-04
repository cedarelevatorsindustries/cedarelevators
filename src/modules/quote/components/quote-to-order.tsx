"use client"

import { useState } from 'react'
import { ShoppingCart, Check, CreditCard, Truck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuoteToOrderProps {
  quoteId: string
  quoteNumber: string
  totalAmount: number
  discount?: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  paymentTerms?: string
  deliveryDays?: string
}

export default function QuoteToOrder({
  quoteId,
  quoteNumber,
  totalAmount,
  discount = 0,
  items,
  paymentTerms = 'Net 30',
  deliveryDays = '5-7 business days'
}: QuoteToOrderProps) {
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'credit' | 'card' | 'bank'>('credit')
  const [selectedAddress, setSelectedAddress] = useState('1')
  const [isConverting, setIsConverting] = useState(false)

  const finalAmount = totalAmount - discount

  const handleConvertToOrder = async () => {
    setIsConverting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsConverting(false)
    setShowConversionModal(false)
    
    // In production, redirect to order confirmation
    alert(`Quote ${quoteNumber} converted to order successfully!`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      {/* Convert Button */}
      <button
        onClick={() => setShowConversionModal(true)}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        <ShoppingCart size={20} />
        Convert to Order
      </button>

      {/* Conversion Modal */}
      {showConversionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Convert Quote to Order</h2>
              <p className="text-sm text-gray-600 mt-1">
                Review your quote details and complete your order
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Quote Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-blue-900">Quote Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Quote Number:</span>
                    <span className="font-semibold text-gray-900">{quoteNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Items:</span>
                    <span className="font-semibold text-gray-900">{items.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Quote Discount:</span>
                      <span className="font-semibold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-lg text-blue-900">{formatCurrency(finalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className={cn(
                    'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                    selectedPayment === 'credit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={selectedPayment === 'credit'}
                      onChange={(e) => setSelectedPayment(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Credit Account</p>
                      <p className="text-sm text-gray-600">Payment Terms: {paymentTerms}</p>
                      <p className="text-xs text-green-600 mt-1">Available Credit: ₹3,75,000</p>
                    </div>
                  </label>

                  <label className={cn(
                    'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                    selectedPayment === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPayment === 'card'}
                      onChange={(e) => setSelectedPayment(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Credit/Debit Card</p>
                      <p className="text-sm text-gray-600">Visa •••• 4242</p>
                    </div>
                  </label>

                  <label className={cn(
                    'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                    selectedPayment === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={selectedPayment === 'bank'}
                      onChange={(e) => setSelectedPayment(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Net Banking</p>
                      <p className="text-sm text-gray-600">Pay via your bank</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">Office - 123 Business Park, Mumbai, MH 400001</option>
                  <option value="2">Warehouse - 456 Industrial Area, Pune, MH 411001</option>
                  <option value="3">Site - 789 Construction Zone, Thane, MH 400601</option>
                </select>
              </div>

              {/* Delivery Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="text-green-600" size={20} />
                  <h4 className="font-semibold text-green-900">Delivery Information</h4>
                </div>
                <p className="text-sm text-green-800">
                  Estimated delivery: {deliveryDays}
                </p>
              </div>

              {/* Terms */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Important</h4>
                    <p className="text-sm text-yellow-800">
                      By converting this quote to an order, you agree to the quoted prices and terms. 
                      The quote discount will be automatically applied.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConversionModal(false)}
                  disabled={isConverting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvertToOrder}
                  disabled={isConverting}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isConverting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Confirm Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

