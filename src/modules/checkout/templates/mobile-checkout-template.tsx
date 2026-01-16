/**
 * Mobile Checkout Template - Step-based flow
 * Three-step checkout process optimized for mobile devices
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useUserPricing } from '@/lib/hooks/useUserPricing'
import {
    ArrowLeft,
    ShoppingCart,
    FileText,
    CheckCircle2,
    User,
    Truck,
    Store,
    MapPin,
    CreditCard,
    AlertCircle,
    TrendingUp,
    Shield,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Phone,
    X,
    Edit2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/cart-context'

import { getPickupLocations } from '@/lib/actions/checkout/get-pickup-locations'
import type {
    CheckoutSource,
    CheckoutPermission,
    ShippingMethod,
    PickupLocation
} from '../types/checkout-ui'

import { getCheckoutFromQuote } from '@/lib/actions/checkout/core'
import { validateIndividualOrder } from '@/lib/actions/checkout/individual-validation'
import { createOrderFromCheckout } from '@/lib/actions/checkout/create-order'
import { toast } from 'sonner'

type CheckoutStep = 1 | 2 | 3

export default function MobileCheckoutTemplate() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isLoaded } = useUser()
    const { userType: pricingUserType, isVerified, isLoaded: isPricingLoaded } = useUserPricing()
    const { derivedItems, summary: cartSummary, isLoading: isCartLoading } = useCart()

    const source = (searchParams.get('source') as CheckoutSource) || 'cart'
    const quoteId = searchParams.get('quoteId') || ''

    const [currentStep, setCurrentStep] = useState<CheckoutStep>(1)
    const [checkoutData, setCheckoutData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('doorstep')
    const [pickupLocationId, setPickupLocationId] = useState<string>()
    const [isProcessing, setIsProcessing] = useState(false)
    const [limitViolations, setLimitViolations] = useState<string[]>([])
    const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([])
    const [itemsExpanded, setItemsExpanded] = useState(false)

    const userType = !isPricingLoaded || !user
        ? 'guest'
        : pricingUserType === 'business'
            ? (isVerified ? 'business_verified' : 'business_unverified')
            : 'individual'

    const permission: CheckoutPermission = !isPricingLoaded || !user
        ? 'blocked_signin'
        : userType === 'business_unverified'
            ? 'blocked_verify'
            : userType === 'business_verified'
                ? 'full_checkout'
                : 'individual_checkout'

    useEffect(() => {
        async function loadPickupLocations() {
            const locations = await getPickupLocations()
            setPickupLocations(locations)
        }
        loadPickupLocations()
    }, [])

    useEffect(() => {
        if (!isLoaded) return

        async function loadData() {
            setIsLoading(true)
            try {
                if (source === 'quote' && quoteId) {
                    const result = await getCheckoutFromQuote(quoteId)
                    if (result.success && result.data) {
                        setCheckoutData(result.data)

                        if (permission === 'individual_checkout') {
                            const validation = await validateIndividualOrder(
                                result.data.items,
                                result.data.summary.total
                            )
                            setLimitViolations(validation.violations)
                        }
                    }
                } else if (source === 'cart') {
                    if (derivedItems.length > 0) {
                        setCheckoutData({
                            items: derivedItems.map(item => ({
                                id: item.product_id,
                                title: item.title,
                                thumbnail: item.thumbnail || null,
                                quantity: item.quantity,
                                unit_price: item.unit_price,
                                subtotal: item.line_total,
                                slug: item.product?.slug
                            })),
                            summary: {
                                subtotal: cartSummary.subtotal,
                                tax: cartSummary.tax,
                                shipping: cartSummary.shipping,
                                discount: cartSummary.discount,
                                total: cartSummary.total,
                                currency: 'INR'
                            },
                            canCheckout: cartSummary.canCheckout
                        })
                    } else {
                        setCheckoutData(null)
                    }
                }
            } catch (error) {
                console.error('Checkout load error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (source === 'cart' && isCartLoading) {
            setIsLoading(true)
            return
        }

        loadData()
    }, [isLoaded, isPricingLoaded, source, quoteId, permission, derivedItems, cartSummary, isCartLoading])

    const handlePlaceOrder = async () => {
        if (isProcessing || !checkoutData) return
        setIsProcessing(true)

        try {
            // Prepare cart items for order creation
            const cartItems = checkoutData.items.map((item: any) => ({
                product_id: item.id || item.product_id,
                variant_id: item.variant_id,
                title: item.title || item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price || item.unitPrice || 0,
                thumbnail: item.thumbnail
            }))

            const result = await createOrderFromCheckout({
                cartItems,
                summary: checkoutData.summary,
                shippingMethod,
                pickupLocationId,
                paymentMethod: 'cod'
            })

            if (result.success && result.orderId) {
                toast.success('Order placed successfully!')
                router.push(`/order-confirmation?orderId=${result.orderId}`)
            } else {
                toast.error(result.error || 'Failed to place order')
                setIsProcessing(false)
            }
        } catch (error: any) {
            console.error('Order placement error:', error)
            toast.error(error.message || 'Failed to place order')
            setIsProcessing(false)
        }
    }

    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep((prev) => (prev + 1) as CheckoutStep)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as CheckoutStep)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const getProgressPercentage = () => {
        return (currentStep / 3) * 100
    }

    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return 'Shipping & Delivery'
            case 2:
                return 'Payment Method'
            case 3:
                return 'Final Review'
        }
    }

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    if (permission === 'blocked_signin') {
        router.push('/sign-in?redirect=/checkout')
        return null
    }

    if (permission === 'blocked_verify') {
        router.push('/profile/business/verify')
        return null
    }

    if (!checkoutData) {
        return (
            <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">No Checkout Data</h2>
                    <Link href="/" className="text-orange-600 hover:underline">Return to Home</Link>
                </div>
            </div>
        )
    }

    const isIndividual = permission === 'individual_checkout'
    const hasViolations = limitViolations.length > 0

    return (
        <div className="min-h-screen bg-[#f8f7f5] pb-32">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="flex flex-col p-4">
                    <div className="flex items-center justify-between w-full mb-1">
                        <button onClick={() => currentStep === 1 ? router.back() : handlePrevStep()} className="p-2 -ml-2">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold">Checkout</h1>
                        <button onClick={() => router.push('/cart')} className="p-2 -mr-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-[#9c7349] text-xs flex items-center justify-center gap-2">
                        {source === 'quote' ? (
                            <>
                                <FileText className="w-3 h-3" />
                                Source: Quote: {checkoutData?.quote?.quote_number || quoteId}
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-3 h-3" />
                                Source: Cart
                            </>
                        )}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="px-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">STEP {currentStep} OF 3</span>
                        <span className="text-xs font-bold text-orange-600">{Math.round(getProgressPercentage())}%</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-600 transition-all duration-300"
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                    <h2 className="text-sm font-bold mt-2">{getStepTitle()}</h2>
                </div>
            </div>

            {/* Step Content */}
            <div className="p-4">
                {/* Step 1: Shipping & Delivery */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        {/* Items in Order */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <button
                                onClick={() => setItemsExpanded(!itemsExpanded)}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">ITEMS IN ORDER ({checkoutData.items.length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-orange-600 font-medium">{itemsExpanded ? 'Hide' : 'View All'}</span>
                                    {itemsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </button>

                            {itemsExpanded && (
                                <div className="border-t border-gray-200">
                                    {checkoutData.items.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-3 p-4 border-b border-gray-100 last:border-0">
                                            <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                                                {item.thumbnail && (
                                                    <Image src={item.thumbnail} alt={item.title} width={48} height={48} className="object-cover rounded" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.title}</p>
                                                <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-orange-600">₹{item.subtotal.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Choose Delivery Method */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-bold mb-3">Choose Delivery Method</h3>

                            <div className="space-y-3">
                                <label className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${shippingMethod === 'doorstep' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="doorstep"
                                            checked={shippingMethod === 'doorstep'}
                                            onChange={() => setShippingMethod('doorstep')}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Truck className="w-4 h-4 text-orange-600" />
                                                <span className="font-bold text-sm">Doorstep Delivery</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Delivered to your home or work in 7 days</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${shippingMethod === 'pickup' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="pickup"
                                            checked={shippingMethod === 'pickup'}
                                            onChange={() => setShippingMethod('pickup')}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Store className="w-4 h-4 text-orange-600" />
                                                <span className="font-bold text-sm">In-Store Pickup</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Collect from our store in just 2 days</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Shipping Address / Pickup Locations */}
                        {shippingMethod === 'doorstep' ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold">Shipping Address</h3>
                                    <button className="text-xs text-orange-600 font-medium">Add New</button>
                                </div>

                                <div className="border border-orange-600 rounded-lg p-3 bg-orange-50">
                                    <div className="flex items-start gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold bg-orange-600 text-white px-2 py-0.5 rounded">HOME/OFFICE</span>
                                                <button className="text-xs text-orange-600 font-medium">Edit</button>
                                            </div>
                                            <p className="text-sm font-medium">John Doe</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                4/234 Innovation Street, Tech Park Phase II,<br />
                                                Electronic City, Bangalore - 560100
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">+91 98765 43210</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-bold mb-3">Pickup Locations</h3>

                                {pickupLocations.length > 0 ? (
                                    <div className="space-y-3">
                                        {pickupLocations.map((location) => (
                                            <label
                                                key={location.id}
                                                className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${pickupLocationId === location.id ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="pickup_location"
                                                        value={location.id}
                                                        checked={pickupLocationId === location.id}
                                                        onChange={() => setPickupLocationId(location.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm">{location.name}</p>
                                                        <p className="text-xs text-gray-600">{location.address}, {location.city}</p>
                                                        {location.phone && (
                                                            <p className="text-xs text-gray-600 mt-1">📞 {location.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 mb-1">No pickup locations available</p>
                                        <p className="text-xs text-gray-400">Pickup locations will be added soon</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Payment Method */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-orange-800 uppercase mb-1">Next: Final Review</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-base font-bold mb-2">Choose how to pay</h3>
                            <p className="text-xs text-gray-600 mb-4">Select a payment option for your order</p>

                            <div className="space-y-3">
                                <label className="block p-4 border-2 border-orange-600 bg-orange-50 rounded-lg cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked
                                            readOnly
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CreditCard className="w-4 h-4 text-orange-600" />
                                                <span className="font-bold text-sm">Cash on Delivery (COD)</span>
                                                <CheckCircle2 className="w-4 h-4 text-orange-600 ml-auto" />
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                Payment will be collected at delivery/pickup
                                            </p>
                                        </div>
                                    </div>
                                </label>


                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-bold mb-3">Price Summary</h3>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{checkoutData.summary.subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-gray-600">Paid on delivery</span>
                                </div>
                                {checkoutData.summary.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">GST</span>
                                        <span className="font-medium">₹{checkoutData.summary.tax.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="h-px bg-gray-200 my-2" />
                                <div className="flex justify-between text-base">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-orange-600">₹{checkoutData.summary.total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Final Review */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-orange-800">Review your details before placing the order</p>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center gap-2">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${isIndividual ? 'bg-orange-600' : 'bg-green-600'
                                } text-white`}>
                                {isIndividual ? <User className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                <span className="text-xs font-bold">
                                    {isIndividual ? 'Role: Individual Buyer' : 'Verified Business'}
                                </span>
                            </div>
                        </div>

                        {/* Upgrade Nudge */}
                        {isIndividual && (
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">Want to save 10-15% more on your next order?</p>
                                <Link href="/profile/business" className="text-xs text-orange-600 font-bold flex items-center gap-1">
                                    Upgrade to Business →
                                </Link>
                            </div>
                        )}

                        {/* Items */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-bold mb-3">Items</h3>
                            <div className="space-y-3">
                                {checkoutData.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                                            {item.thumbnail && (
                                                <Image src={item.thumbnail} alt={item.title} width={64} height={64} className="object-cover rounded" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{item.title}</p>
                                            <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">₹{item.subtotal.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold">Shipping</h3>
                                <button onClick={() => setCurrentStep(1)} className="text-xs text-orange-600 font-medium">Edit</button>
                            </div>
                            <div className="flex items-start gap-2">
                                {shippingMethod === 'doorstep' ? (
                                    <>
                                        <Truck className="w-4 h-4 text-orange-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Standard Delivery</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                123 Innovation Ave, Suite 400<br />
                                                Oakland, CA 94107
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Store className="w-4 h-4 text-orange-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">In-Store Pickup</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {pickupLocations.find(l => l.id === pickupLocationId)?.name || 'Selected location'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold">Payment</h3>
                                <button onClick={() => setCurrentStep(2)} className="text-xs text-orange-600 font-medium">Edit</button>
                            </div>
                            <div className="flex items-start gap-2">
                                <CreditCard className="w-4 h-4 text-orange-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Cash on Delivery (COD)</p>
                                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{checkoutData.summary.subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-gray-600">Paid on delivery</span>
                                </div>
                                {checkoutData.summary.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (VAT)</span>
                                        <span className="font-medium">₹{checkoutData.summary.tax.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="h-px bg-gray-200 my-2" />
                                <div className="flex justify-between text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-orange-600">₹{checkoutData.summary.total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-600">
                        {currentStep === 3 ? 'Total' : `Subtotal (${checkoutData.items.length} items)`}
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                        ₹{checkoutData.summary.total.toLocaleString('en-IN')}
                    </span>
                </div>

                <button
                    onClick={currentStep === 3 ? handlePlaceOrder : handleNextStep}
                    disabled={isProcessing || hasViolations}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        'Processing...'
                    ) : currentStep === 3 ? (
                        <>
                            Place Order <CheckCircle2 className="w-5 h-5" />
                        </>
                    ) : (
                        <>
                            Next: {currentStep === 1 ? 'Payment Method' : 'Final Review'} <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </button>

                {currentStep === 3 && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                        By placing order, you agree to our Terms of Service
                    </p>
                )}
            </div>
        </div>
    )
}
