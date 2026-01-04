"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/hooks'
import { useAccountType } from '@/lib/hooks'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { logger } from "@/lib/services/logger"

// Sections
import ProgressBarSection from '../sections/01-progress-bar-section'
import GuestEmailCaptureSection from '../sections/02-guest-email-capture-section'
import CheckoutBlockedSection from '../sections/03-checkout-blocked-section'
import ShippingAddressSection from '../sections/04-shipping-address-section'
import BillingAddressSection from '../sections/05-billing-address-section'
import DeliveryOptionsSection from '../sections/06-delivery-options-section'
import PaymentMethodSection from '../sections/07-payment-method-section'
import OrderSummarySection from '../sections/08-order-summary-section'

// Components
import CartSummarySticky from '../components/cart-summary-sticky'
import TrustBadges from '../components/trust-badges'
import WhatsAppButton from '../components/whatsapp-button'
import ExitIntentPopup from '../components/exit-intent-popup'

// Types
import type {
  CheckoutAddress,
  DeliveryOption,
  PaymentMethod,
  UserCheckoutType,
  CheckoutStep,
  OrderSummary
} from '../types'

export default function CheckoutTemplate() {
  const router = useRouter()
  const { cart, items, itemCount } = useCart()
  const { isGuest, isBusiness, user, isLoaded } = useAccountType()

  // Check verification status
  const isVerified = user?.publicMetadata?.verified === true ||
    user?.unsafeMetadata?.verified === true

  // Determine user checkout type
  const getUserType = (): UserCheckoutType => {
    if (isGuest) return 'guest'
    if (!isBusiness) return 'individual'
    return isVerified ? 'business_verified' : 'business_unverified'
  }

  const userType = getUserType()
  const showPrices = userType === 'business_verified'

  // Determine initial step
  const getInitialStep = (): CheckoutStep => {
    if (userType === 'guest') return 'email_capture'
    if (userType === 'individual' || userType === 'business_unverified') return 'blocked'
    return 'shipping'
  }

  // State
  const [step, setStep] = useState<CheckoutStep>(getInitialStep())
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddress | undefined>()
  const [billingAddress, setBillingAddress] = useState<CheckoutAddress | undefined>()
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | undefined>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showExitPopup, setShowExitPopup] = useState(false)

  // Steps for progress calculation
  const steps: CheckoutStep[] = ['email_capture', 'blocked', 'shipping', 'payment', 'review']

  // Update step when user type changes
  useEffect(() => {
    if (isLoaded) {
      setStep(getInitialStep())
    }
  }, [isLoaded, userType])

  // Build order summary
  const orderSummary: OrderSummary = {
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal || item.unit_price * item.quantity,
    })),
    subtotal: cart?.subtotal || 0,
    discount: cart?.discount_total || 0,
    shipping: deliveryOption?.price || 0,
    tax: cart?.tax_total || 0,
    total: cart?.total || 0,
    showPrices,
  }

  // Empty cart check
  if (isLoaded && itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add products to your cart before checkout.</p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Handlers
  const handleGuestEmailSubmit = (data: { email: string; phone: string }) => {
    setGuestEmail(data.email)
    setGuestPhone(data.phone)
    // After email capture, show blocked state for guests
    setStep('blocked')
  }

  const handleRequestQuote = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implement quote request API
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/order-confirmation/quote-123?type=quote')
    } catch (error) {
      logger.error('Quote request failed', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!termsAccepted || userType !== 'business_verified') return

    setIsProcessing(true)
    try {
      // Place order via Supabase
      await new Promise(resolve => setTimeout(resolve, 2000))
      router.push('/order-confirmation/order-123?type=order')
    } catch (error) {
      logger.error('Order placement failed', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const canProceedToPayment = !!shippingAddress && !!deliveryOption
  const canPlaceOrder = canProceedToPayment && !!paymentMethod && termsAccepted

  // Render based on step/user type
  // Step 1: Guest Email Capture
  if (step === 'email_capture' && userType === 'guest') {
    return (
      <>
        <GuestEmailCaptureSection onSubmit={handleGuestEmailSubmit} />
        <WhatsAppButton floating />
      </>
    )
  }

  // Step 2: Blocked State (Guest after email, Individual, Unverified Business)
  if (step === 'blocked' || userType === 'individual' || userType === 'business_unverified' ||
    (userType === 'guest' && guestEmail)) {
    return (
      <>
        <CheckoutBlockedSection
          userType={userType === 'guest' ? 'guest' : userType}
          onRequestQuote={handleRequestQuote}
          isLoading={isProcessing}
        />
        <WhatsAppButton floating />
      </>
    )
  }

  // Step 3: Full Checkout (Verified Dealers Only)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <ProgressBarSection currentStep={steps.indexOf(step) + 1} userType={userType} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <ShippingAddressSection
              selectedAddress={shippingAddress}
              onSelectAddress={setShippingAddress}
              onAddNewAddress={(addr) => setShippingAddress(addr)}
            />

            {/* Billing Address */}
            {shippingAddress && (
              <BillingAddressSection
                shippingAddress={shippingAddress}
                billingAddress={billingAddress}
                sameAsShipping={sameAsShipping}
                onSameAsShippingChange={setSameAsShipping}
                onBillingAddressChange={setBillingAddress}
              />
            )}

            {/* Delivery Options */}
            {shippingAddress && (
              <DeliveryOptionsSection
                selectedOption={deliveryOption}
                onSelectOption={setDeliveryOption}
                showPrices={showPrices}
                options={[]}
              />
            )}

            {/* Payment Method */}
            {deliveryOption && (
              <PaymentMethodSection
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
                isVerifiedDealer={userType === 'business_verified'}
                methods={[]}
              />
            )}

            {/* Terms & Place Order */}
            {paymentMethod && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <div
                    className={`
                      w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5 transition-colors
                      ${termsAccepted ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
                    `}
                    onClick={() => setTermsAccepted(!termsAccepted)}
                  >
                    {termsAccepted && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </span>
                </label>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder || isProcessing}
                  className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg
                    hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <TrustBadges />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <CartSummarySticky
              summary={orderSummary}
              showBulkCalculator={showPrices}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton floating />

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <ExitIntentPopup
          onClose={() => setShowExitPopup(false)}
          onApplyDiscount={(code) => logger.info('Apply discount attempt', { code })}
        />
      )}
    </div>
  )
}

