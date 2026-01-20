"use client"

import { useEffect, useState, useRef } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import { Package, Truck, MapPin, FileText, ChevronDown, Download, Eye, ShieldCheck, Headphones, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface OrderItem {
    id: string
    title: string
    thumbnail?: string | null
    unit_price: number
    quantity: number
    total: number
}

interface Address {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    tax_id?: string
}

interface OrderConfirmationProps {
    orderId: string
    orderDate: string
    status: 'pending' | 'confirmed' | 'processing'
    shippingAddress: Address
    billingAddress: Address
    items: OrderItem[]
    subtotal: number
    tax: number
    taxRate: number
    shipping: number
    total: number
    expectedDispatch: string
    shippingMethod: string
    paymentMethod: 'cod' | 'prepaid'
}

export default function OrderConfirmationPage({
    orderId,
    orderDate,
    status,
    shippingAddress,
    billingAddress,
    items,
    subtotal,
    tax,
    taxRate,
    shipping,
    total,
    expectedDispatch,
    shippingMethod,
    paymentMethod,
}: OrderConfirmationProps) {
    const [animationData, setAnimationData] = useState<any>(null)
    const [animationComplete, setAnimationComplete] = useState(false)
    const [isItemsExpanded, setIsItemsExpanded] = useState(true)
    const [copied, setCopied] = useState(false)
    const [showStickyHeader, setShowStickyHeader] = useState(false)
    const lottieRef = useRef<LottieRefCurrentProps>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch('/animation/Tick Animation.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error('Failed to load animation:', err))

        // Show email confirmation toast
        const timer = setTimeout(() => {
            toast.success('We\'ve emailed the invoice to you', {
                duration: 4000,
            })
        }, 1500)

        // Sticky header on scroll (mobile)
        const handleScroll = () => {
            if (headerRef.current) {
                const headerBottom = headerRef.current.getBoundingClientRect().bottom
                setShowStickyHeader(headerBottom < 0)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(timer)
        }
    }, [])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(orderId)
        setCopied(true)
        toast.success('Order ID copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }

    const getStatusBadge = () => {
        if (paymentMethod === 'cod' && status === 'pending') {
            return { text: 'COD (Pending)', color: 'bg-amber-100 text-amber-700 border-amber-200' }
        }
        return { text: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200' }
    }

    const statusBadge = getStatusBadge()

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
            {/* Sticky Header - Mobile Only */}
            <div
                className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md transition-transform duration-300 lg:hidden ${showStickyHeader ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                        <p className="text-lg font-bold text-gray-900">#{orderId}</p>
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Copy order ID"
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-green-600" />
                        ) : (
                            <Copy className="w-5 h-5 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>
            <div className="max-w-[800px] mx-auto">
                {/* Success Icon */}
                <div ref={headerRef} className="flex flex-col items-center text-center mb-10">
                    <div className="w-20 h-20 flex items-center justify-center mb-4">
                        {!animationComplete ? (
                            animationData && (
                                <Lottie
                                    lottieRef={lottieRef}
                                    animationData={animationData}
                                    loop={false}
                                    autoplay={true}
                                    style={{ width: 80, height: 80 }}
                                    onComplete={() => setAnimationComplete(true)}
                                />
                            )
                        ) : (
                            <img
                                src="/animation/tick.svg"
                                alt="Success"
                                className="w-16 h-16"
                            />
                        )}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-600 mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-lg text-green-600">
                        Thank you. Your order has been successfully placed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="space-y-6">
                        {/* Order Summary Card */}
                        <Card className="overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                                <div className="flex items-start gap-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                            Order ID
                                        </p>
                                        <h2 className="text-xl font-bold text-gray-900">#{orderId}</h2>
                                        <p className="text-sm text-gray-500 mt-1">Order Date: {orderDate}</p>
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="mt-5 p-1.5 hover:bg-gray-100 rounded-md transition-colors group"
                                        aria-label="Copy order ID"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                                        )}
                                    </button>
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                                    <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current"></span>
                                    {statusBadge.text}
                                </span>
                            </div>

                            {/* Delivery Address */}
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    Delivery Address
                                </h3>
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    {shippingAddress.name}<br />
                                    {shippingAddress.line1}<br />
                                    {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
                                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">Verified Business</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">Secure Order</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">GST Invoice Included</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-4">
                                    * In addition, a delivery charge will apply
                                </p>
                            </div>

                            {/* Price Breakdown */}
                            <div className="px-6 py-4 bg-gray-50">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Tax (GST {taxRate}%)</span>
                                        <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping</span>
                                        <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                                            {shipping === 0 ? 'Paid on Delivery' : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                        <span>Total Amount</span>
                                        <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Order Items - Expandable */}
                        <Card className="overflow-hidden shadow-sm">
                            <button
                                onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                            >
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Order Items ({items.length})
                                </h2>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform ${isItemsExpanded ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isItemsExpanded && (
                                <div className="px-6 pb-6 space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 py-3 border-t border-gray-100">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                                                {item.thumbnail ? (
                                                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <Package className="w-8 h-8" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                                <p className="text-sm text-gray-500">
                                                    Unit Price: ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">x {item.quantity}</p>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right Column - What Happens Next */}
                    <div className="space-y-6">
                        {/* What Happens Next Section */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-orange-500 text-xl">📋</span>
                                <h2 className="text-xl font-bold text-gray-900">
                                    What Happens Next
                                </h2>
                            </div>

                            <div className="space-y-5">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                                            1
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">Order Confirmation Email</h3>
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full border bg-orange-100 text-orange-700 border-orange-200">
                                                IMMEDIATE
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            We've just sent a detailed order summary to your registered email address.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                                            2
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <h3 className="font-bold text-gray-900 mb-1">Processing COD Order</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Since this is a Cash on Delivery order, please ensure you have the exact amount ready upon delivery.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                                            3
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <h3 className="font-bold text-gray-900 mb-1">Shipped & Tracked</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Once your package ships, we'll notify you via email and you can track it in real-time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <Link href="/profile/orders">
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 rounded-xl shadow-md flex items-center justify-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Track Order
                                </Button>
                            </Link>
                            <Link href="/catalog">
                                <Button
                                    variant="outline"
                                    className="w-full font-bold py-6 rounded-xl flex items-center justify-center gap-2"
                                >
                                    Explore More Parts
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center border-t border-gray-200 pt-8 pb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm font-medium mb-4">
                        <FileText className="w-4 h-4" />
                        Invoice has been emailed to you
                    </div>
                    <p className="text-gray-500 text-sm">
                        Questions about your order?{' '}
                        <Link href="/contact" className="text-orange-600 font-bold hover:underline">
                            Visit Help Center
                        </Link>{' '}
                        or email us at{' '}
                        <span className="font-semibold text-gray-800">support@cedarelevators.com</span>
                    </p>
                </footer>
            </div>
        </div>
    )
}
