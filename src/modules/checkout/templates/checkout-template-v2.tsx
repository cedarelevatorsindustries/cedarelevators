/**
 * Checkout Template V2
 * Cedar Elevator Industries
 * 
 * Updated checkout template that uses the new cart-v2 system:
 * - Integrates with cart context
 * - Proper eligibility checking
 * - Cart conversion on order completion
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { useCart } from '@/contexts/cart-context'
import { CheckoutEligibilityGuard } from '@/components/cart/checkout-eligibility-guard'
import { convertCartToOrder } from '@/lib/actions/cart-conversion'
import { UserType, canCheckout } from '@/types/cart.types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Sections
import ProgressBarSection from '../sections/01-progress-bar-section'
import ShippingAddressSection from '../sections/04-shipping-address-section'
import BillingAddressSection from '../sections/05-billing-address-section'
import DeliveryOptionsSection from '../sections/06-delivery-options-section'
import PaymentMethodSection from '../sections/07-payment-method-section'

// Components
import CartSummarySticky from '../components/cart-summary-sticky'
import TrustBadges from '../components/trust-badges'
import WhatsAppButton from '../components/whatsapp-button'

// Types
import type {
  CheckoutAddress,
  DeliveryOption,
  PaymentMethod,
  CheckoutStep
} from '../types'

export default function CheckoutTemplateV2() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { cart, derivedItems, summary, isLoading, context } = useCart()

  // Determine user type
  const getUserType = (): UserType => {
    if (!isSignedIn) return 'guest'
    const accountType = user?.publicMetadata?.accountType as string || 'individual'
    if (accountType === 'business') {
      const verificationStatus = user?.publicMetadata?.verificationStatus as string
      return verificationStatus === 'verified' ? 'business_verified' : 'business_unverified'
    }
    return 'individual'
  }

  const userType = getUserType()
  const showPrices = canCheckout(userType)

  // Checkout state
  const [step, setStep] = useState<CheckoutStep>('shipping')
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddress | undefined>()
  const [billingAddress, setBillingAddress] = useState<CheckoutAddress | undefined>()
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | undefined>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Progress calculation
  const steps: CheckoutStep[] = ['shipping', 'billing', 'delivery', 'payment', 'review']
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!cart || !paymentMethod || !shippingAddress || !deliveryOption || !termsAccepted) {
      toast.error('Please complete all required fields')
      return
    }

    setIsProcessing(true)
    try {
      // TODO: Integrate with actual order creation API
      // For now, just convert cart
      if (cart.id) {
        const result = await convertCartToOrder(cart.id)
        if (result.success) {
          toast.success('Order placed successfully!')
          router.push('/order-confirmation')
        } else {
          toast.error(result.error || 'Failed to place order')
        }
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <CheckoutEligibilityGuard userType={userType} summary={summary}>
      <div className="min-h-screen bg-gray-50" data-testid="checkout-page">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-[1400px] mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBarSection currentStep={currentStepIndex + 1} totalSteps={steps.length} />

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              {step === 'shipping' && (
                <ShippingAddressSection
                  selectedAddress={shippingAddress}
                  onSelectAddress={setShippingAddress}
                  onAddNewAddress={setShippingAddress}
                />
              )}

              {/* Billing Address */}
              {step === 'billing' && (
                <BillingAddressSection
                  billingAddress={billingAddress}
                  onBillingAddressChange={setBillingAddress}
                  sameAsShipping={sameAsShipping}
                  onSameAsShippingChange={setSameAsShipping}
                  shippingAddress={shippingAddress}
                />
              )}

              {/* Delivery Options */}
              {step === 'delivery' && (
                <DeliveryOptionsSection
                  selectedOption={deliveryOption}
                  onSelectOption={setDeliveryOption}
                  showPrices={showPrices}
                  options={[]}
                />
              )}

              {/* Payment Method */}
              {step === 'payment' && (
                <PaymentMethodSection
                  selectedMethod={paymentMethod}
                  onSelectMethod={setPaymentMethod}
                  isVerifiedDealer={userType === 'business_verified'}
                  methods={[]}
                />
              )}

              {/* Trust Badges */}
              <TrustBadges />
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <CartSummarySticky
                summary={{
                  items: derivedItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    thumbnail: item.thumbnail ?? null,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    subtotal: item.line_total
                  })),
                  subtotal: summary.subtotal,
                  discount: summary.discount,
                  shipping: deliveryOption?.price || summary.shipping,
                  tax: summary.tax,
                  total: summary.total,
                  showPrices
                }}
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Support */}
        <WhatsAppButton />
      </div>
    </CheckoutEligibilityGuard>
  )
}
