/**
 * Checkout Page Content
 * Cedar Elevator Industries
 * 
 * Main checkout flow with:
 * - Address selection/creation
 * - Order summary with GST breakdown
 * - Payment method selection
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCart } from '@/contexts/cart-context'
import { CheckoutAddressSection } from './checkout-address-section'
import { CheckoutOrderSummary } from './checkout-order-summary'
import { CheckoutPaymentSection } from './checkout-payment-section'
import { CheckoutProgress } from './checkout-progress'
import { getBusinessAddresses, getCheckoutSummary } from '@/lib/actions/checkout'
import { getShippingSettings } from '@/lib/services/settings'
import type { BusinessAddress, CheckoutSummary } from '@/lib/actions/checkout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

type CheckoutStep = 'address' | 'review' | 'payment'

export function CheckoutPageContent() {
  const router = useRouter()
  const { user } = useUser()
  const { cart, summary: cartSummary } = useCart()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address')
  const [addresses, setAddresses] = useState<BusinessAddress[]>([])
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string | null>(null)
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string | null>(null)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveryEta, setDeliveryEta] = useState<string>('')

  // Load addresses and checkout summary
  useEffect(() => {
    async function loadCheckoutData() {
      if (!cart?.id) return

      setIsLoading(true)
      setError(null)

      try {
        // Load addresses
        const addressResult = await getBusinessAddresses()
        if (addressResult.success && addressResult.data) {
          setAddresses(addressResult.data)

          // Auto-select default addresses
          const defaultShipping = addressResult.data.find(
            addr => addr.is_default && (addr.address_type === 'shipping' || addr.address_type === 'both')
          )
          const defaultBilling = addressResult.data.find(
            addr => addr.is_default && (addr.address_type === 'billing' || addr.address_type === 'both')
          )

          if (defaultShipping) setSelectedShippingAddress(defaultShipping.id!)
          if (defaultBilling) setSelectedBillingAddress(defaultBilling.id!)
        }

        // Load checkout summary
        const summaryResult = await getCheckoutSummary(cart.id)
        if (summaryResult.success && summaryResult.data) {
          setCheckoutSummary(summaryResult.data)
        }

        // Load shipping settings for delivery ETA
        const shippingResult = await getShippingSettings()
        if (shippingResult.success && shippingResult.data?.delivery_sla_text) {
          setDeliveryEta(shippingResult.data.delivery_sla_text)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load checkout data')
      } finally {
        setIsLoading(false)
      }
    }

    loadCheckoutData()
  }, [cart?.id])

  const handleAddressAdded = async () => {
    // Reload addresses
    const result = await getBusinessAddresses()
    if (result.success && result.data) {
      setAddresses(result.data)
    }
  }

  const canProceedToReview = !!(selectedShippingAddress && (billingSameAsShipping || selectedBillingAddress))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="checkout-page">
      {/* Progress Indicator */}
      <CheckoutProgress currentStep={currentStep} />

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <CheckoutAddressSection
            addresses={addresses}
            selectedShippingAddress={selectedShippingAddress}
            selectedBillingAddress={selectedBillingAddress}
            billingSameAsShipping={billingSameAsShipping}
            onSelectShippingAddress={setSelectedShippingAddress}
            onSelectBillingAddress={setSelectedBillingAddress}
            onBillingSameAsShippingChange={setBillingSameAsShipping}
            onAddressAdded={handleAddressAdded}
            isActive={currentStep === 'address'}
          />

          {/* Payment Section */}
          {currentStep === 'payment' && (
            <CheckoutPaymentSection
              cartId={cart?.id || ''}
              shippingAddressId={selectedShippingAddress!}
              billingAddressId={billingSameAsShipping ? selectedShippingAddress! : selectedBillingAddress!}
              totalAmount={checkoutSummary?.total || 0}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <CheckoutOrderSummary
            cartSummary={cartSummary}
            checkoutSummary={checkoutSummary}
            canProceedToPayment={canProceedToReview}
            currentStep={currentStep}
            onProceedToPayment={() => setCurrentStep('payment')}
            deliveryEta={deliveryEta}
          />
        </div>
      </div>
    </div>
  )
}

