/**
 * Address Section Component
 * Handles address selection and management in checkout
 */

'use client'

import { useState } from 'react'
import { BusinessAddress, addBusinessAddress } from '@/lib/actions/checkout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Check } from 'lucide-react'
import { AddAddressDialog } from './add-address-dialog'
import { toast } from 'sonner'

interface AddressSectionProps {
  addresses: BusinessAddress[]
  selectedShippingAddress: string | null
  selectedBillingAddress: string | null
  useSameAddress: boolean
  onShippingAddressChange: (id: string) => void
  onBillingAddressChange: (id: string) => void
  onUseSameAddressChange: (value: boolean) => void
  onAddressesUpdate: () => void
}

export function AddressSection({
  addresses,
  selectedShippingAddress,
  selectedBillingAddress,
  useSameAddress,
  onShippingAddressChange,
  onBillingAddressChange,
  onUseSameAddressChange,
  onAddressesUpdate,
}: AddressSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const shippingAddresses = addresses.filter(
    (addr) => addr.address_type === 'shipping' || addr.address_type === 'both'
  )

  const billingAddresses = addresses.filter(
    (addr) => addr.address_type === 'billing' || addr.address_type === 'both'
  )

  return (
    <div className="space-y-6">
      {/* Shipping Address */}
      <Card className="p-6" data-testid="shipping-address-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
            data-testid="add-address-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>

        {shippingAddresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No shipping addresses found</p>
            <Button onClick={() => setShowAddDialog(true)}>Add Address</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {shippingAddresses.map((address) => (
              <div
                key={address.id}
                onClick={() => onShippingAddressChange(address.id!)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedShippingAddress === address.id
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                data-testid={`shipping-address-${address.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900">{address.contact_name}</p>
                      {address.is_default && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{address.address_line1}</p>
                    {address.address_line2 && (
                      <p className="text-sm text-gray-700">{address.address_line2}</p>
                    )}
                    <p className="text-sm text-gray-700">
                      {address.city}, {address.state} - {address.postal_code}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Phone: {address.contact_phone}</p>
                    {address.gst_number && (
                      <p className="text-sm text-gray-600">GST: {address.gst_number}</p>
                    )}
                  </div>
                  {selectedShippingAddress === address.id && (
                    <div className="ml-4">
                      <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Billing Address Same as Shipping */}
      <Card className="p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useSameAddress}
            onChange={(e) => onUseSameAddressChange(e.target.checked)}
            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            data-testid="same-address-checkbox"
          />
          <span className="text-gray-900 font-medium">Billing address same as shipping</span>
        </label>
      </Card>

      {/* Billing Address (if different) */}
      {!useSameAddress && (
        <Card className="p-6" data-testid="billing-address-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Billing Address</h2>

          {billingAddresses.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No billing addresses found</p>
              <Button onClick={() => setShowAddDialog(true)}>Add Address</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {billingAddresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => onBillingAddressChange(address.id!)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedBillingAddress === address.id
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`billing-address-${address.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">{address.contact_name}</p>
                        {address.is_default && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{address.address_line1}</p>
                      {address.address_line2 && (
                        <p className="text-sm text-gray-700">{address.address_line2}</p>
                      )}
                      <p className="text-sm text-gray-700">
                        {address.city}, {address.state} - {address.postal_code}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Phone: {address.contact_phone}</p>
                      {address.gst_number && (
                        <p className="text-sm text-gray-600">GST: {address.gst_number}</p>
                      )}
                    </div>
                    {selectedBillingAddress === address.id && (
                      <div className="ml-4">
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Add Address Dialog */}
      <AddAddressDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={onAddressesUpdate}
      />
    </div>
  )
}
