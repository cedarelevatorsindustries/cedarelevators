'use client'

import { OrderWithDetails } from "@/lib/types/orders"
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle,
    MapPin,
    CreditCard,
    Calendar,
    Download
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { convertToLocale } from "@/lib/utils/currency/money"
import { formatOrderDate, getOrderStatus } from "@/lib/utils/orders/helpers"

interface OrderDetailsTemplateProps {
    order: OrderWithDetails
}

export default function OrderDetailsTemplate({ order }: OrderDetailsTemplateProps) {
    // Determine current step index based on status
    const status = order.order_status
    const steps = [
        { id: 'placed', label: 'Order Placed', icon: Package },
        { id: 'processing', label: 'Processing', icon: Package },
        { id: 'shipped', label: 'Shipped', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle },
    ]

    let currentStep = 0
    if (status === 'processing') currentStep = 1
    if (status === 'shipped') currentStep = 2
    if (status === 'delivered') currentStep = 3
    if (status === 'cancelled') currentStep = -1

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Link href="/profile/orders" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Placed on {formatOrderDate(order.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Download size={16} />
                        Invoice
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors">
                        Track Order
                    </button>
                </div>
            </div>

            {/* Status Stepper */}
            {status !== 'cancelled' ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                    <div className="relative flex items-center justify-between">
                        {/* Progress Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0 -translate-y-1/2 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 -translate-y-1/2 rounded-full"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {/* Steps */}
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStep
                            const isCurrent = index === currentStep

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                                        ${isCompleted
                                            ? 'bg-green-50 border-green-500 text-green-600'
                                            : 'bg-white border-gray-200 text-gray-300'
                                        }
                                    `}>
                                        <step.icon size={20} />
                                    </div>
                                    <span className={`text-xs font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-900">Order Cancelled</h3>
                        <p className="text-red-700">This order has been cancelled.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Items ({order.order_items?.length || 0})</h3>
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <div className="relative w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package size={24} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 line-clamp-2">
                                            {item.product_name}
                                        </h4>
                                        {item.variant_name && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.variant_name}
                                            </p>
                                        )}
                                        <div className="flex justify-between items-end mt-2">
                                            <p className="text-sm text-gray-600">
                                                Qty: <span className="font-medium text-gray-900">{item.quantity}</span>
                                            </p>
                                            <p className="font-bold text-gray-900">
                                                {convertToLocale(item.unit_price, 'INR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{convertToLocale(order.subtotal_amount, 'INR')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>{convertToLocale(order.shipping_amount, 'INR')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span>
                                <span>{convertToLocale(order.tax_amount, 'INR')}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>{convertToLocale(order.total_amount, 'INR')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                            <MapPin size={18} className="text-gray-400" />
                            Shipping Address
                        </div>
                        {order.shipping_address ? (
                            <address className="not-italic text-sm text-gray-600 leading-relaxed">
                                <p className="font-medium text-gray-900">
                                    {order.shipping_address.name}
                                </p>
                                <p>{order.shipping_address.address_line1}</p>
                                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                <p>
                                    {order.shipping_address.city}, {order.shipping_address.state}
                                </p>
                                <p>{order.shipping_address.pincode}</p>
                                <p className="mt-2 text-gray-500">{order.shipping_address.phone}</p>
                            </address>
                        ) : (
                            <p className="text-sm text-gray-500">No shipping address provided</p>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                            <CreditCard size={18} className="text-gray-400" />
                            Payment Information
                        </div>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status</span>
                                <span className="font-medium capitalize px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                    {order.payment_status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Method</span>
                                <span className="font-medium text-gray-900">Prepaid / Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
