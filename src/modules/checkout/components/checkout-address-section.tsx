/**
 * Checkout Address Section
 * Handles address selection and creation
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MapPin, Plus, Home, Building } from 'lucide-react'
import { AddAddressDialog } from './add-address-dialog'
import type { BusinessAddress } from '@/lib/actions/checkout'
import { cn } from '@/lib/utils'

interface CheckoutAddressSectionProps {
  addresses: BusinessAddress[]
  selectedShippingAddress: string | null
  selectedBillingAddress: string | null
  billingSameAsShipping: boolean
  onSelectShippingAddress: (id: string) => void
  onSelectBillingAddress: (id: string) => void
  onBillingSameAsShippingChange: (value: boolean) => void
  onAddressAdded: () => void
  isActive: boolean
}

export function CheckoutAddressSection({
  addresses,
  selectedShippingAddress,
  selectedBillingAddress,
  billingSameAsShipping,
  onSelectShippingAddress,
  onSelectBillingAddress,
  onBillingSameAsShippingChange,
  onAddressAdded,
  isActive,
}: CheckoutAddressSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addressTypeToAdd, setAddressTypeToAdd] = useState<'shipping' | 'billing'>('shipping')

  const shippingAddresses = addresses.filter(
    addr => addr.address_type === 'shipping' || addr.address_type === 'both'
  )
  const billingAddresses = addresses.filter(
    addr => addr.address_type === 'billing' || addr.address_type === 'both'
  )

  const formatAddress = (addr: BusinessAddress) => {
    return `${addr.address_line1}, ${addr.address_line2 ? addr.address_line2 + ', ' : ''}${addr.city}, ${addr.state} - ${addr.postal_code}`
  }

  const handleAddAddress = (type: 'shipping' | 'billing') => {
    setAddressTypeToAdd(type)
    setShowAddDialog(true)
  }

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border",
      isActive ? "border-orange-200" : "border-gray-200"
    )} data-testid="address-section">
      {/* Header */}
      <div className={cn(
        "p-6 border-b flex items-center gap-3",
        isActive ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
          isActive ? "bg-orange-600 text-white" : "bg-gray-300 text-gray-600"
        )}>
          1
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
          <p className="text-sm text-gray-500">Select or add delivery address</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Shipping Address */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddAddress('shipping')}
              data-testid="add-shipping-address-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>

          {shippingAddresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No shipping addresses found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleAddAddress('shipping')}
              >
                Add Shipping Address
              </Button>
            </div>
          ) : (
            <RadioGroup
              value={selectedShippingAddress || ''}
              onValueChange={onSelectShippingAddress}
            >
              <div className="space-y-3">
                {shippingAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-colors",
                      selectedShippingAddress === addr.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => onSelectShippingAddress(addr.id!)}
                    data-testid={`shipping-address-${addr.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={addr.id!} id={`shipping-${addr.id}`} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={`shipping-${addr.id}`} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{addr.contact_name}</span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{formatAddress(addr)}</p>
                          <p className="text-sm text-gray-500 mt-1">Phone: {addr.contact_phone}</p>
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        {/* Billing Same as Shipping */}
        <div className="flex items-center space-x-2 py-3 border-t border-gray-200">
          <Checkbox
            id="billing-same"
            checked={billingSameAsShipping}
            onCheckedChange={(checked) => onBillingSameAsShippingChange(checked as boolean)}
            data-testid="billing-same-checkbox"
          />
          <Label
            htmlFor="billing-same"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Billing address same as shipping address
          </Label>
        </div>

        {/* Billing Address (if different) */}
        {!billingSameAsShipping && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Billing Address
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddAddress('billing')}
                data-testid="add-billing-address-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>

            {billingAddresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No billing addresses found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleAddAddress('billing')}
                >
                  Add Billing Address
                </Button>
              </div>
            ) : (
              <RadioGroup
                value={selectedBillingAddress || ''}
                onValueChange={onSelectBillingAddress}
              >
                <div className="space-y-3">
                  {billingAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-colors",
                        selectedBillingAddress === addr.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => onSelectBillingAddress(addr.id!)}
                      data-testid={`billing-address-${addr.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={addr.id!} id={`billing-${addr.id}`} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={`billing-${addr.id}`} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{addr.contact_name}</span>
                              {addr.is_default && (
                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{formatAddress(addr)}</p>
                            <p className="text-sm text-gray-500 mt-1">Phone: {addr.contact_phone}</p>
                            {addr.gst_number && (
                              <p className="text-sm text-gray-500 mt-1">GST: {addr.gst_number}</p>
                            )}
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>
        )}
      </div>

      {/* Add Address Dialog */}
      <AddAddressDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addressType={addressTypeToAdd}
        onSuccess={() => {
          setShowAddDialog(false)
          onAddressAdded()
        }}
      />
    </div>
  )
}
