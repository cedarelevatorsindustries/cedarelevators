/**
 * Shipping Method Selector
 * Choose between Doorstep Delivery and In-Store Pickup
 */

'use client'

import { useState } from 'react'
import { Truck, Store } from 'lucide-react'
import type { ShippingMethod, PickupLocation } from '../types/checkout-ui'
import { PickupLocationSelector } from './pickup-location-selector'

interface ShippingMethodSelectorProps {
    selectedMethod?: ShippingMethod
    selectedPickupLocation?: string
    pickupLocations: PickupLocation[]
    onSelectMethod: (method: ShippingMethod) => void
    onSelectPickupLocation: (locationId: string) => void
    onAddressRequired?: () => void
    deliveryEta?: string  // Optional delivery timeline
}

export function ShippingMethodSelector({
    selectedMethod,
    selectedPickupLocation,
    pickupLocations,
    onSelectMethod,
    onSelectPickupLocation,
    onAddressRequired,
    deliveryEta
}: ShippingMethodSelectorProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Method</h2>

            {/* Method Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Doorstep Delivery */}
                <button
                    type="button"
                    onClick={() => {
                        onSelectMethod('doorstep')
                        onAddressRequired?.()
                    }}
                    className={`
            relative p-4 border-2 rounded-lg transition-all
            ${selectedMethod === 'doorstep'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
          `}
                >
                    <div className="flex items-start gap-3">
                        <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
              ${selectedMethod === 'doorstep'
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                            }
            `}>
                            {selectedMethod === 'doorstep' && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            )}
                        </div>

                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <Truck className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-gray-900">Doorstep Delivery</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Delivered to your address
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Truck className="w-4 h-4 text-blue-600" />
                                <p className="text-xs text-gray-500">
                                    {deliveryEta}
                                </p>
                            </div>
                        </div>
                    </div>
                </button>

                {/* In-Store Pickup */}
                <button
                    type="button"
                    onClick={() => onSelectMethod('pickup')}
                    className={`
            relative p-4 border-2 rounded-lg transition-all
            ${selectedMethod === 'pickup'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
          `}
                >
                    <div className="flex items-start gap-3">
                        <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
              ${selectedMethod === 'pickup'
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                            }
            `}>
                            {selectedMethod === 'pickup' && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            )}
                        </div>

                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <Store className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-gray-900">In-Store Pickup</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Pick up from our store location
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Pickup Location Selector (shown when pickup selected) */}
            {selectedMethod === 'pickup' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <PickupLocationSelector
                        locations={pickupLocations}
                        selected={selectedPickupLocation}
                        onSelect={onSelectPickupLocation}
                    />
                </div>
            )}

            {/* Helper text for doorstep */}
            {selectedMethod === 'doorstep' && (
                <p className="text-sm text-gray-500 mt-4">
                    Please select or add a delivery address below.
                </p>
            )}

            {/* Helper text for pickup */}
            {selectedMethod === 'pickup' && (
                <p className="text-sm text-gray-500 mt-4">
                    You will be notified when the order is ready for pickup.
                </p>
            )}
        </div>
    )
}
