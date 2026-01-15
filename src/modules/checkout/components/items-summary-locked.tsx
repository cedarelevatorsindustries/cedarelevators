/**
 * Items Summary (Read-Only)
 * Displays checkout items without edit/remove options
 */

'use client'

import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import type { CheckoutItem, CheckoutSource } from '../types/checkout-ui'

interface ItemsSummaryLockedProps {
    items: CheckoutItem[]
    source: CheckoutSource
}

export function ItemsSummaryLocked({ items, source }: ItemsSummaryLockedProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Items</h2>
                <span className="text-sm text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </div>

            {/* Helper Text */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                    To modify items, {source === 'quote' ? 'request a new quote' : 'update your cart'}.
                </p>
            </div>

            {/* Items List */}
            <div className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                        {/* Thumbnail */}
                        {item.thumbnail ? (
                            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                            </div>
                        )}

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                        </div>

                        {/* Price (if available) */}
                        {item.unit_price !== undefined && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500">₹{item.unit_price.toLocaleString('en-IN')}/unit</p>
                                {item.subtotal !== undefined && (
                                    <p className="font-semibold text-gray-900 mt-1">
                                        ₹{item.subtotal.toLocaleString('en-IN')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
