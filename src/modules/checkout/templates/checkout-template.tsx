/**
 * Checkout Template - Redesigned UI
 * Modern, clean design matching reference specifications
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
  Phone
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
import SuccessAnimation from '@/modules/checkout/components/success-animation'

export default function CheckoutTemplate() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const { userType: pricingUserType, isVerified, isLoaded: isPricingLoaded } = useUserPricing()
  const { derivedItems, summary: cartSummary, isLoading: isCartLoading } = useCart()


  const source = (searchParams.get('source') as CheckoutSource) || 'cart'
  const quoteId = searchParams.get('quoteId') || ''

  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('doorstep')
  const [pickupLocationId, setPickupLocationId] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [limitViolations, setLimitViolations] = useState<string[]>([])
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([])
  const [defaultAddress, setDefaultAddress] = useState<any>(null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(true)

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

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

  // Fetch default address
  useEffect(() => {
    async function loadDefaultAddress() {
      if (!user) {
        setIsLoadingAddress(false)
        return
      }

      try {
        const response = await fetch('/api/addresses/default')
        if (response.ok) {
          const data = await response.json()
          setDefaultAddress(data.address)
        }
      } catch (error) {
        console.error('Failed to load default address:', error)
      } finally {
        setIsLoadingAddress(false)
      }
    }

    if (isLoaded) {
      loadDefaultAddress()
    }
  }, [isLoaded, user])

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
          // Use cart context data
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

    // Validate address - required for both doorstep and pickup (billing purposes)
    if (!defaultAddress) {
      const addressType = shippingMethod === 'doorstep' ? 'delivery' : 'billing'
      toast.error(`Please add a ${addressType} address to continue`)
      return
    }

    // Validate pickup location for pickup
    if (shippingMethod === 'pickup' && !pickupLocationId) {
      toast.error('Please select a pickup location to continue')
      return
    }

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
        paymentMethod: 'cod' // Cash on Delivery
      })

      if (result.success && result.orderId) {
        setSuccessOrderId(result.orderId)
        setShowSuccessAnimation(true)
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

  const handleAddressAction = () => {
    // Redirect to profile addresses page
    router.push('/profile/addresses?redirect=/checkout')
  }

  const handleAnimationComplete = () => {
    if (successOrderId) {
      router.push(`/order-confirmation?orderId=${successOrderId}`)
    }
  }

  if (showSuccessAnimation) {
    return (
      <SuccessAnimation onAnimationComplete={handleAnimationComplete}>
        {/* We render nothing here as the redirect happens immediately after animation */}
        <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
          <p className="text-gray-500 animate-pulse">Redirecting to order confirmation...</p>
        </div>
      </SuccessAnimation>
    )
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
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#f8f7f5]">
      <main className="max-w-[1200px] mx-auto px-4 py-8 pt-32 lg:px-10">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black leading-tight tracking-tight">Checkout</h1>
            <p className="text-[#9c7349] text-base flex items-center gap-2">
              {source === 'quote' ? (
                <>
                  <FileText className="w-4 h-4" />
                  Source: Quote: {checkoutData.quote?.quote_number || quoteId}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Source: Cart
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm">
            {isIndividual ? (
              <>
                <User className="w-4 h-4" />
                <span>Individual Buyer</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Business</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Items Summary */}
            <section className="bg-white rounded-xl border border-[#f4ede7] overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-[#f4ede7]">
                <h2 className="text-xl font-bold">Items Summary</h2>
              </div>

              <div className="divide-y divide-[#f4ede7]">
                {checkoutData.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 justify-between">
                    <div className="flex items-center gap-4">
                      <Link href={item.slug ? `/products/${item.slug}` : '#'} className="w-16 h-16 bg-gray-100 rounded-lg border border-[#f4ede7] overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.title} width={64} height={64} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col">
                        <Link href={item.slug ? `/products/${item.slug}` : '#'} className="text-base font-semibold leading-tight hover:text-orange-600 transition-colors">
                          {item.title}
                        </Link>
                        <p className="text-[#9c7349] text-sm mt-1">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    {item.subtotal && (
                      <div className="text-right">
                        <p className="text-base font-medium">₹{item.subtotal.toLocaleString('en-IN')}</p>
                        {item.unit_price && (
                          <p className="text-xs text-[#9c7349]">₹{item.unit_price.toLocaleString('en-IN')} / unit</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {source === 'quote' && (
                <div className="bg-orange-600/5 p-4 border-t border-orange-600/20">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <p className="text-sm text-[#9c7349]">
                      Items in this order are tied to your approved quote. To modify quantities or items, please{' '}
                      <Link href="/quotes" className="font-bold text-orange-600 underline">request a new quote</Link>.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Shipping Options */}
            <section className="bg-white rounded-xl border border-[#f4ede7] p-6">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                Shipping Options
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${shippingMethod === 'doorstep'
                  ? 'border-orange-600 bg-orange-600/5'
                  : 'border-[#f4ede7] hover:border-orange-600/50'
                  }`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="doorstep"
                    checked={shippingMethod === 'doorstep'}
                    onChange={() => setShippingMethod('doorstep')}
                    className="absolute top-4 right-4 text-orange-600 focus:ring-orange-600"
                  />
                  <span className="font-bold text-lg mb-1">Doorstep Delivery</span>
                  <span className="text-sm text-[#9c7349]">Delivered to your address</span>
                </label>

                <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${shippingMethod === 'pickup'
                  ? 'border-orange-600 bg-orange-600/5'
                  : 'border-[#f4ede7] hover:border-orange-600/50'
                  }`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="pickup"
                    checked={shippingMethod === 'pickup'}
                    onChange={() => setShippingMethod('pickup')}
                    className="absolute top-4 right-4 text-orange-600 focus:ring-orange-600"
                  />
                  <span className="font-bold text-lg mb-1">In-Store Pickup</span>
                  <span className="text-sm text-[#9c7349]">Ready at your nearest branch</span>
                </label>
              </div>

              {/* Address Section - Always shown, label changes based on shipping method */}
              <div className="mt-6 p-4 border border-[#f4ede7] rounded-lg bg-[#f8f7f5]">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-sm uppercase tracking-wide">
                    {shippingMethod === 'doorstep' ? 'Shipping Address' : 'Billing Address'}
                  </p>
                  <button
                    onClick={handleAddressAction}
                    className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline"
                  >
                    {defaultAddress ? 'Edit Address' : 'Add Address'}
                  </button>
                </div>
                {isLoadingAddress ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 animate-pulse" />
                    <div>
                      <p className="text-[#9c7349] text-sm">Loading address...</p>
                    </div>
                  </div>
                ) : defaultAddress ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">{defaultAddress.name || 'Delivery Address'}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {defaultAddress.address_line1 || defaultAddress.address_line_1}
                        {(defaultAddress.address_line2 || defaultAddress.address_line_2) && `, ${defaultAddress.address_line2 || defaultAddress.address_line_2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode || defaultAddress.postal_code}
                      </p>
                      {defaultAddress.phone && (
                        <p className="text-sm text-gray-500 mt-1">{defaultAddress.phone}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="font-medium text-gray-900 mb-1">
                      {shippingMethod === 'doorstep' ? 'No Delivery Address' : 'No Billing Address'}
                    </p>
                    <p className="text-sm text-[#9c7349] mb-4">
                      {shippingMethod === 'doorstep'
                        ? 'Please add a delivery address to place your order'
                        : 'Please add a billing address to continue'}
                    </p>
                    <button
                      onClick={handleAddressAction}
                      className="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </div>

              {shippingMethod === 'pickup' && (
                <div className="mt-6 space-y-3">
                  {pickupLocations.map((location) => (
                    <label
                      key={location.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${pickupLocationId === location.id
                        ? 'border-orange-600 bg-orange-600/5'
                        : 'border-[#f4ede7] hover:border-orange-600/50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="pickup_location"
                        value={location.id}
                        checked={pickupLocationId === location.id}
                        onChange={() => setPickupLocationId(location.id)}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <Store className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold">{location.name}</p>
                          <p className="text-sm text-[#9c7349]">{location.address}, {location.city}</p>
                          {location.phone && (
                            <p className="text-sm text-[#9c7349] flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {location.phone}
                            </p>
                          )}
                        </div>
                        {pickupLocationId === location.id && (
                          <CheckCircle2 className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                    </label>
                  ))}
                  {pickupLocations.length === 0 && (
                    <p className="text-sm text-[#9c7349] italic p-4">Loading pickup locations...</p>
                  )}
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-xl border border-[#f4ede7] p-6">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Payment Method
              </h2>

              <div className="flex items-center gap-4 p-4 border-2 border-orange-600 bg-orange-600/5 rounded-xl relative">
                <div className="bg-orange-600/20 p-2 rounded-lg">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none">Cash on Delivery (COD)</span>
                  <span className="text-sm text-[#9c7349] mt-1">
                    {isIndividual
                      ? 'Pay with cash or card upon arrival.'
                      : 'Payment upon receipt via corporate check or bank transfer.'
                    }
                  </span>
                </div>
                <CheckCircle2 className="absolute top-4 right-4 text-orange-600 w-5 h-5" />
              </div>

              {isIndividual && (
                <p className="mt-4 text-xs text-[#9c7349] flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Individual buyer COD limits apply to this transaction.
                </p>
              )}
            </section>
          </div>

          {/* Right Column - Sticky Summary */}
          <div className="w-full lg:w-[360px]">
            <div className="sticky top-24 flex flex-col gap-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl border border-[#f4ede7] p-6 shadow-sm">
                <h3 className="text-lg font-bold border-b border-[#f4ede7] pb-4 mb-4">Order Summary</h3>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-base">
                    <span className="text-[#9c7349]">Subtotal</span>
                    <span className="font-medium">₹{checkoutData.summary.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-[#9c7349]">Shipping</span>
                    <span className="text-gray-600 font-medium">Paid on delivery</span>
                  </div>
                  {checkoutData.summary.tax > 0 && (
                    <div className="flex justify-between text-base">
                      <span className="text-[#9c7349]">GST</span>
                      <span className="font-medium">₹{Math.round(checkoutData.summary.tax).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="h-px bg-[#f4ede7] my-2"></div>
                  <div className="flex justify-between text-xl font-black">
                    <span>Total</span>
                    <span className="text-orange-600">₹{Math.round(checkoutData.summary.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {isIndividual && (
                  <div className="mt-6 bg-[#fcfaf8] p-3 rounded-lg border border-dashed border-[#d1c2b4]">
                    <p className="text-xs text-[#9c7349] italic">
                      Individual pricing. Business accounts may receive bulk benefits and tax exemptions.
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={hasViolations || isProcessing || !defaultAddress || (shippingMethod === 'pickup' && !pickupLocationId)}
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-600/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20"
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                  <ChevronRight className="w-5 h-5" />
                </button>
                {!defaultAddress && !isLoadingAddress && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Please add a {shippingMethod === 'doorstep' ? 'delivery' : 'billing'} address to place your order
                  </p>
                )}
                {shippingMethod === 'pickup' && !pickupLocationId && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Please select a pickup location to place your order
                  </p>
                )}
              </div>

              {/* Upgrade Nudge (Individual only) */}
              {isIndividual && (
                <div className="bg-white rounded-xl border border-orange-600/30 p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-orange-600">
                    <TrendingUp className="w-5 h-5" />
                    <p className="font-bold text-sm uppercase tracking-tight">Business Upgrade</p>
                  </div>
                  <p className="text-sm font-medium">Buying for business or bulk needs?</p>
                  <Link href="/profile/business" className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline group">
                    Upgrade to Business Account
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

              {/* Warning - Violations */}
              {hasViolations && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-900 mb-1">Order Exceeds Limits</p>
                    {limitViolations.map((violation, i) => (
                      <p key={i} className="text-xs text-red-700 leading-relaxed">{violation}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badge */}
              {!isIndividual && (
                <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">Purchase Protection</p>
                    <p className="text-xs text-blue-700">This business transaction is secured and insured.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
