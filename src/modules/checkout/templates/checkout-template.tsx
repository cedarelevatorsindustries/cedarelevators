/**
 * Complete Checkout Template - Redesigned
 * Supports cart and quote flows with role-based permissions
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Components
import { CheckoutHeader } from '../components/checkout-header'
import { ItemsSummaryLocked } from '../components/items-summary-locked'
import { PricingSummaryLocked } from '../components/pricing-summary-locked'
import { BusinessInfoDisplay } from '../components/business-info-display'
import { ShippingMethodSelector } from '../components/shipping-method-selector'
import { PaymentMethodSelector } from '../components/payment-method-selector'
import { CheckoutActionPanel } from '../components/checkout-action-panel'
import { MobileStickyCTA } from '../components/mobile-sticky-cta'

// Types
import type {
  CheckoutSource,
  CheckoutPermission,
  ShippingMethod,
  CheckoutAddress,
  ShippingOption,
  PickupLocation
} from '../types/checkout-ui'

// Actions
import { getCheckoutFromQuote } from '@/lib/actions/checkout/core'
import { validateIndividualOrder } from '@/lib/actions/checkout/individual-validation'

// Mock pickup locations - replace with actual data fetch
const PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: '1',
    name: 'Cedar Store – Chennai',
    address: 'T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    phone: '+91-44-1234-5678',
    hours: 'Mon-Sat: 9 AM - 7 PM',
    is_active: true
  },
  {
    id: '2',
    name: 'Cedar Store – Bangalore',
    address: 'Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    phone: '+91-80-1234-5678',
    hours: 'Mon-Sat: 9 AM - 7 PM',
    is_active: true
  }
]

export default function CheckoutTemplate() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()

  // Detect source and IDs from URL
  const source = (searchParams.get('source') as CheckoutSource) || 'cart'
  const quoteId = searchParams.get('quoteId') || ''

  // State
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>()
  const [pickupLocationId, setPickupLocationId] = useState<string>()
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddress>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [limitViolations, setLimitViolations] = useState<string[]>([])

  // Determine user type and permission
  const userType = !user
    ? 'guest'
    : !user.publicMetadata?.businessProfile
      ? 'individual'
      : user.publicMetadata?.verified
        ? 'business_verified'
        : 'business_unverified'

  const permission: CheckoutPermission = !user
    ? 'blocked_signin'
    : userType === 'business_unverified'
      ? 'blocked_verify'
      : userType === 'business_verified'
        ? 'full_checkout'
        : 'individual_checkout'

  // Load checkout data
  useEffect(() => {
    if (!isLoaded) return

    async function loadData() {
      setIsLoading(true)
      try {
        if (source === 'quote' && quoteId) {
          const result = await getCheckoutFromQuote(quoteId)
          if (result.success) {
            setCheckoutData(result.data)

            // Validate individual limits if needed
            if (permission === 'individual_checkout' && result.data) {
              const validation = await validateIndividualOrder(
                result.data.items,
                result.data.summary.total
              )
              setLimitViolations(validation.violations)
            }
          }
        }
        // Cart flow would go here
      } catch (error) {
        console.error('Checkout load error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isLoaded, source, quoteId, permission])

  // Handlers
  const handlePlaceOrder = async () => {
    if (!shippingMethod || isProcessing) return
    if (shippingMethod === 'doorstep' && !shippingAddress) return
    if (shippingMethod === 'pickup' && !pickupLocationId) return

    setIsProcessing(true)
    try {
      const shippingOption: ShippingOption = {
        method: shippingMethod,
        pickupLocationId: shippingMethod === 'pickup' ? pickupLocationId : undefined,
        address: shippingMethod === 'doorstep' ? shippingAddress : undefined
      }

      // TODO: Call backend order creation
      // const result = await createOrder(source, sourceId, shippingOption, 'cod')

      await new Promise(resolve => setTimeout(resolve, 2000)) // Mock delay
      router.push('/orders')
    } catch (error) {
      console.error('Order placement error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    )
  }

  // Blocked states
  if (permission === 'blocked_signin') {
    router.push('/sign-in?redirect=/checkout')
    return null
  }

  if (permission === 'blocked_verify') {
    router.push('/profile/business/verify')
    return null
  }

  // No data
  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Checkout Data</h2>
          <p className="text-gray-600 mb-4">Unable to load checkout information.</p>
          <Link href="/" className="text-orange-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const canProceed = !!shippingMethod &&
    (shippingMethod === 'pickup' ? !!pickupLocationId : !!shippingAddress) &&
    limitViolations.length === 0

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={source === 'quote' ? `/quotes/${quoteId}` : '/cart'}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {source === 'quote' ? 'Quote' : 'Cart'}
        </Link>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            <CheckoutHeader
              source={source}
              sourceId={quoteId}
              quoteNumber={checkoutData.quoteNumber}
              userType={userType}
              permission={permission}
            />

            <ItemsSummaryLocked
              items={checkoutData.items}
              source={source}
            />

            <PricingSummaryLocked
              summary={checkoutData.summary}
              source={source}
              permission={permission}
            />

            {/* Business Info (verified business only) */}
            {permission === 'full_checkout' && checkoutData.businessInfo && (
              <BusinessInfoDisplay info={checkoutData.businessInfo} />
            )}

            {/* Shipping Method (all checkout users) */}
            {(permission === 'full_checkout' || permission === 'individual_checkout') && (
              <ShippingMethodSelector
                selectedMethod={shippingMethod}
                selectedPickupLocation={pickupLocationId}
                pickupLocations={PICKUP_LOCATIONS}
                onSelectMethod={setShippingMethod}
                onSelectPickupLocation={setPickupLocationId}
              />
            )}

            {/* Address Selector (doorstep delivery) */}
            {shippingMethod === 'doorstep' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
                <p className="text-sm text-gray-500">
                  Address selector component - reuse existing or create new
                </p>
                {/* TODO: Import and use AddressSelector component */}
              </div>
            )}

            {/* Payment Method (COD only) */}
            {(permission === 'full_checkout' || permission === 'individual_checkout') && (
              <PaymentMethodSelector />
            )}
          </div>

          {/* Right Column - Action Panel */}
          <div className="lg:col-span-1">
            <CheckoutActionPanel
              permission={permission}
              onPlaceOrder={handlePlaceOrder}
              onVerify={() => router.push('/profile/business/verify')}
              onRegister={() => router.push('/profile/business')}
              onSignIn={() => router.push('/sign-in')}
              isProcessing={isProcessing}
              total={checkoutData.summary.total}
              limitViolations={limitViolations}
              canProceed={canProceed}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        permission={permission}
        total={checkoutData.summary.total}
        onAction={handlePlaceOrder}
        actionLabel="Place Order"
        isProcessing={isProcessing}
        canProceed={canProceed}
      />
    </div>
  )
}
