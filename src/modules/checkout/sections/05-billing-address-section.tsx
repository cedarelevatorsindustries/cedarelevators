"use client"

import { useState } from 'react'
import { Receipt, Check } from 'lucide-react'
import type { CheckoutAddress } from '../types'
import AddressForm from '../components/address-form'

interface BillingAddressSectionProps {
  shippingAddress?: CheckoutAddress
  billingAddress?: CheckoutAddress
  sameAsShipping: boolean
  onSameAsShippingChange: (same: boolean) => void
  onBillingAddressChange: (address: CheckoutAddress) => void
}

export default function BillingAddressSection({
  shippingAddress,
  billingAddress,
  sameAsShipping,
  onSameAsShippingChange,
  onBillingAddressChange,
}: BillingAddressSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Receipt className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Billing Address</h2>
          <p className="text-sm text-gray-500">For GST invoice generation</p>
        </div>
      </div>

      {/* Same as Shipping Checkbox */}
      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer mb-4">
        <div 
          className={`
            w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
            ${sameAsShipping 
              ? 'bg-blue-600 border-blue-600' 
              : 'border-gray-300 bg-white'
            }
          `}
          onClick={() => onSameAsShippingChange(!sameAsShipping)}
        >
          {sameAsShipping && <Check className="w-4 h-4 text-white" />}
        </div>
        <span className="text-gray-700 font-medium">Same as shipping address</span>
      </label>

      {/* Show shipping address preview if same */}
      {sameAsShipping && shippingAddress && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {shippingAddress.firstName} {shippingAddress.lastName}
          </p>
          {shippingAddress.company && (
            <p className="text-sm text-gray-600">{shippingAddress.company}</p>
          )}
          <p className="text-sm text-gray-600">
            {shippingAddress.address1}
            {shippingAddress.address2 && `, ${shippingAddress.address2}`}
          </p>
          <p className="text-sm text-gray-600">
            {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
          </p>
          {shippingAddress.gstin && (
            <p className="text-sm text-gray-500 mt-2">
              GSTIN: {shippingAddress.gstin}
            </p>
          )}
        </div>
      )}

      {/* Billing Address Form */}
      {!sameAsShipping && (
        <AddressForm
          initialData={billingAddress}
          onSubmit={onBillingAddressChange}
          showGSTIN={true}
          submitLabel="Save Billing Address"
        />
      )}
    </div>
  )
}
