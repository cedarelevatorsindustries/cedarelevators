'use client'

import { useState } from 'react'
import { OrderWithDetails } from "@/lib/types/orders"
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle,
    MapPin,
    CreditCard,
    Clock
} from "lucide-react"
import Link from "next/link"
import { convertToLocale } from "@/lib/utils/currency/money"
import { formatOrderDate } from "@/lib/utils/orders/helpers"
import OrderStatusBadge from "../components/order-status-badge"
import DocumentsSection from "../components/documents-section"
import SupportCTA from "../components/support-cta"
import { cancelOrder } from "@/lib/actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface OrderDetailsTemplateProps {
    order: OrderWithDetails
    pickupLocation?: any | null
}

export default function OrderDetailsTemplate({ order, pickupLocation }: OrderDetailsTemplateProps) {
    const router = useRouter()
    const [cancelDialog, setCancelDialog] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

    // Determine current step index based on status
    const status = (order.order_status || order.status)?.toLowerCase()
    const paymentMethod = order.payment_method?.toLowerCase()
    const isCOD = paymentMethod === 'cod'

    // Different steps for COD vs prepaid
    const steps = isCOD ? [
        { id: 'placed', label: 'Order Placed', icon: Package, date: order.created_at },
        { id: 'processing', label: 'Processing', icon: Package, date: order.processing_at },
        { id: 'shipped', label: 'Shipped', icon: Truck, date: order.shipped_at },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle, date: order.delivered_at },
    ] : [
        { id: 'placed', label: 'Order Placed', icon: Package, date: order.created_at },
        { id: 'payment', label: 'Payment Confirmed', icon: CheckCircle, date: order.payment_confirmed_at },
        { id: 'processing', label: 'Processing', icon: Package, date: order.processing_at },
        { id: 'shipped', label: 'Shipped', icon: Truck, date: order.shipped_at },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle, date: order.delivered_at },
    ]

    let currentStep = 0
    if (isCOD) {
        // COD status mapping (no payment step)
        if (status === 'processing') currentStep = 1
        if (status === 'shipped') currentStep = 2
        if (status === 'delivered') currentStep = 3
        if (status === 'cancelled') currentStep = -1
    } else {
        // Prepaid status mapping
        if (status === 'payment_confirmed' || status === 'paid') currentStep = 1
        if (status === 'processing') currentStep = 2
        if (status === 'shipped') currentStep = 3
        if (status === 'delivered') currentStep = 4
        if (status === 'cancelled') currentStep = -1
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/profile/orders"
                        className="hidden md:block p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.order_number || order.id?.slice(0, 8).toUpperCase()}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-gray-500 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Placed on {formatOrderDate(order.created_at)}
                            </p>
                            <div className="md:hidden">
                                <OrderStatusBadge status={order.order_status || order.status || 'pending'} className="text-xs px-2 py-0.5" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="hidden md:block">
                        <OrderStatusBadge status={order.order_status || order.status || 'pending'} />
                    </div>
                    {/* Cancel Button - Only show if order is not cancelled or delivered */}
                    {status !== 'cancelled' && status !== 'delivered' && status !== 'shipped' && (
                        <Button
                            variant="outline"
                            className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                            onClick={() => setCancelDialog(true)}
                        >
                            Cancel Order
                        </Button>
                    )}
                </div>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>

                {status !== 'cancelled' ? (
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" style={{ zIndex: 0 }}></div>
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
                            style={{
                                width: `${(currentStep / (steps.length - 1)) * 100}%`,
                                zIndex: 0
                            }}
                        ></div>

                        {/* Steps */}
                        <div className="relative flex justify-between" style={{ zIndex: 1 }}>
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStep
                                const isCurrent = index === currentStep

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                            ${isCompleted
                                                ? 'bg-green-50 border-green-500 text-green-600'
                                                : 'bg-white border-gray-200 text-gray-300'
                                            }
                                            ${isCurrent ? 'ring-4 ring-green-100' : ''}
                                        `}>
                                            <step.icon size={18} />
                                        </div>
                                        <div className="text-center">
                                            <span className={`text-xs font-medium block ${isCompleted ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {step.label}
                                            </span>
                                            {step.date && isCompleted && (
                                                <span className="text-[10px] text-gray-500 block mt-0.5">
                                                    {new Date(step.date).toLocaleDateString('en-IN', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <Package size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-red-900">Order Cancelled</h4>
                            <p className="text-red-700 text-sm">This order has been cancelled.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Order Items & Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">
                                Order Items ({order.order_items?.length || 0})
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4 px-6 py-4 justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package size={24} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-base font-semibold leading-tight">
                                                {item.product_name}
                                            </h4>
                                            {item.variant_name && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.variant_name}
                                                </p>
                                            )}
                                            <p className="text-gray-600 text-sm mt-1">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-medium">₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</p>
                                        <p className="text-sm text-gray-500">₹{item.unit_price.toLocaleString('en-IN')} / unit</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{Math.round(order.subtotal_amount).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (GST {order.gst_percentage || 18}%)</span>
                                <span>₹{Math.round(order.tax_amount).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">
                                    {order.shipping_amount > 0 ? `₹${Math.round(order.shipping_amount).toLocaleString('en-IN')}` : 'Paid on delivery'}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                <span>Grand Total</span>
                                <span>₹{Math.round(order.total_amount).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Address, Payment, Documents, Support */}
                <div className="space-y-6">
                    {/* Address Details or Pickup Location */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                            <MapPin size={18} className="text-gray-400" />
                            {order.shipping_method === 'pickup' ? 'Pickup Location' : 'Address Details'}
                        </div>

                        {order.shipping_method === 'pickup' ? (
                            /* Pickup Location Display */
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    In-Store Pickup
                                </p>
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    <p className="font-medium text-gray-900 mb-2">
                                        You selected in-store pickup
                                    </p>
                                    {pickupLocation && (
                                        <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
                                            <p className="font-semibold text-gray-900">{pickupLocation.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">{pickupLocation.address}</p>
                                            <p className="text-sm text-gray-600">{pickupLocation.city}</p>
                                            {pickupLocation.phone && (
                                                <p className="text-sm text-gray-500 mt-1">📞 {pickupLocation.phone}</p>
                                            )}
                                        </div>
                                    )}
                                    <p className="mt-3 text-xs bg-blue-50 text-blue-700 p-3 rounded-lg">
                                        Please collect your order from our store location. You will receive pickup details via email.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Shipping Address Display */
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Shipping Address
                                </p>
                                {order.shipping_address ? (
                                    <address className="not-italic text-sm text-gray-600 leading-relaxed">
                                        <p className="font-medium text-gray-900">
                                            {order.shipping_address.name || 'Delivery Address'}
                                        </p>
                                        <p>{order.shipping_address.address_line1}</p>
                                        {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                        <p>
                                            {order.shipping_address.city}, {order.shipping_address.state}
                                        </p>
                                        <p>{order.shipping_address.postal_code || order.shipping_address.pincode}</p>
                                        <p className="mt-2 text-gray-500">{order.shipping_address.phone}</p>
                                    </address>
                                ) : (
                                    <p className="text-sm text-gray-500">No shipping address provided</p>
                                )}
                            </div>
                        )}

                        {/* Billing Address - Always show for pickup, conditionally for doorstep */}
                        {(order.shipping_method === 'pickup' || order.billing_address) && (
                            <div className={order.shipping_method === 'pickup' ? 'pt-4' : 'pt-4 border-t border-gray-200'}>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Billing Address
                                </p>
                                {order.billing_address ? (
                                    <address className="not-italic text-sm text-gray-600 leading-relaxed">
                                        <p className="font-medium text-gray-900">
                                            {order.billing_address.name || 'Billing Address'}
                                        </p>
                                        <p>{order.billing_address.address_line1}</p>
                                        {order.billing_address.address_line2 && <p>{order.billing_address.address_line2}</p>}
                                        <p>
                                            {order.billing_address.city}, {order.billing_address.state}
                                        </p>
                                        <p>{order.billing_address.postal_code || order.billing_address.pincode}</p>
                                        <p className="mt-2 text-gray-500">{order.billing_address.phone}</p>
                                        {order.billing_address.gstin && (
                                            <p className="mt-2 text-xs text-gray-500">GSTIN: {order.billing_address.gstin}</p>
                                        )}
                                    </address>
                                ) : (
                                    <p className="text-sm text-gray-500">No billing address provided</p>
                                )}
                            </div>
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
                                <span className={`font-medium capitalize px-2 py-0.5 rounded text-xs ${order.payment_status === 'paid'
                                    ? 'bg-green-50 text-green-700'
                                    : order.payment_status === 'pending'
                                        ? 'bg-yellow-50 text-yellow-700'
                                        : 'bg-gray-50 text-gray-700'
                                    }`}>
                                    {order.payment_status || 'Pending'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Method</span>
                                <span className="font-medium text-gray-900 uppercase">
                                    {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method || 'Prepaid / Online'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <DocumentsSection
                        orderId={order.id}
                        quoteId={order.quote_id || undefined}
                        quoteNumber={order.quote_number || undefined}
                    />

                    {/* Support CTA */}
                    <SupportCTA orderId={order.id} />
                </div>
            </div>

            {/* Cancel Order Dialog */}
            <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="cancelReason">Reason for Cancellation *</Label>
                            <Textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please provide a reason for cancelling this order..."
                                rows={3}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCancelDialog(false)
                                setCancelReason('')
                            }}
                            disabled={isCancelling}
                        >
                            Keep Order
                        </Button>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={async () => {
                                if (!cancelReason.trim()) {
                                    toast.error('Please provide a reason for cancellation')
                                    return
                                }

                                setIsCancelling(true)
                                try {
                                    const result = await cancelOrder(order.id, cancelReason)
                                    if (result.success) {
                                        toast.success('Order cancelled successfully')
                                        setCancelDialog(false)
                                        setCancelReason('')
                                        router.refresh()
                                    } else {
                                        toast.error(result.error || 'Failed to cancel order')
                                    }
                                } catch (error) {
                                    toast.error('Failed to cancel order')
                                } finally {
                                    setIsCancelling(false)
                                }
                            }}
                            disabled={isCancelling}
                        >
                            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
