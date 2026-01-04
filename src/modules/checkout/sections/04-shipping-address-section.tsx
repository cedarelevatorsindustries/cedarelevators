"use client"

import { useState } from 'react'
import { MapPin, Plus, Check } from 'lucide-react'
import type { CheckoutAddress } from '../types'
import AddressForm from '../components/address-form'

interface ShippingAddressSectionProps {
  savedAddresses?: CheckoutAddress[]
  selectedAddress?: CheckoutAddress
  onSelectAddress: (address: CheckoutAddress) => void
  onAddNewAddress: (address: CheckoutAddress) => void
}

export default function ShippingAddressSection({
  savedAddresses = [],
  selectedAddress,
  onSelectAddress,
  onAddNewAddress,
}: ShippingAddressSectionProps) {
  const [showNewForm, setShowNewForm] = useState(savedAddresses.length === 0)

  const handleNewAddressSubmit = (address: CheckoutAddress) => {
    onAddNewAddress(address)
    setShowNewForm(false)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
          <p className="text-sm text-gray-500">Where should we deliver your order?</p>
        </div>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && !showNewForm && (
        <div className="space-y-3 mb-4">
          {savedAddresses.map((address) => {
            const isSelected = selectedAddress?.id === address.id
            return (
              <button
                key={address.id}
                onClick={() => onSelectAddress(address)}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {address.firstName} {address.lastName}
                      </span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {address.company && (
                      <p className="text-sm text-gray-600 mb-1">{address.company}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {address.address1}
                      {address.address2 && `, ${address.address2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} - {address.postalCode}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📞 {address.phone}
                    </p>
                    {address.gstin && (
                      <p className="text-sm text-gray-500 mt-1">
                        GSTIN: {address.gstin}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}

          {/* Add New Address Button */}
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 
              text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors
              flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>
      )}

      {/* New Address Form */}
      {showNewForm && (
        <div>
          {savedAddresses.length > 0 && (
            <button
              onClick={() => setShowNewForm(false)}
              className="text-sm text-blue-600 hover:underline mb-4"
            >
              ← Back to saved addresses
            </button>
          )}
          <AddressForm
            onSubmit={handleNewAddressSubmit}
            showGSTIN={true}
          />
        </div>
      )}
    </div>
  )
}

