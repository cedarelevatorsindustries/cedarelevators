/**
 * Pickup Location Selector
 * Choose store location for pickup
 */

'use client'

import { MapPin, Phone, Clock } from 'lucide-react'
import type { PickupLocation } from '../types/checkout-ui'

interface PickupLocationSelectorProps {
    locations: PickupLocation[]
    selected?: string
    onSelect: (locationId: string) => void
}

export function PickupLocationSelector({
    locations,
    selected,
    onSelect
}: PickupLocationSelectorProps) {
    const activeLocations = locations.filter(loc => loc.is_active)

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Pickup Location</h3>

            <div className="space-y-3">
                {activeLocations.map((location) => (
                    <button
                        key={location.id}
                        type="button"
                        onClick={() => onSelect(location.id)}
                        className={`
              w-full text-left p-4 border-2 rounded-lg transition-all
              ${selected === location.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }
            `}
                    >
                        <div className="flex items-start gap-3">
                            {/* Radio Button */}
                            <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                ${selected === location.id
                                    ? 'border-orange-500 bg-orange-500'
                                    : 'border-gray-300'
                                }
              `}>
                                {selected === location.id && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                            </div>

                            {/* Location Details */}
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{location.name}</h4>

                                <div className="space-y-1">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{location.address}, {location.city}</span>
                                    </div>

                                    {location.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                            <span>{location.phone}</span>
                                        </div>
                                    )}

                                    {location.hours && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>{location.hours}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {activeLocations.length === 0 && (
                <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                    No pickup locations available at this time.
                </p>
            )}
        </div>
    )
}
