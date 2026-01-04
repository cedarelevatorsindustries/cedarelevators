/**
 * Checkout Page
 * Cedar Elevator Industries
 * 
 * Main checkout flow with:
 * - Address selection/management
 * - Order summary with pricing
 * - Payment integration
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { useCart } from '@/contexts/cart-context'
import { CheckoutGuard } from '@/components/checkout/checkout-guard'
import {
  getBusinessAddresses,
  getCheckoutSummary,
  createOrderFromCart,
  type BusinessAddress,
  type CheckoutSummary
} from '@/lib/actions/checkout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, MapPin, Package, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'
import { AddressSection } from '@/components/checkout/address-section'
import { OrderSummarySection } from '@/components/checkout/order-summary-section'
import { PaymentSection } from '@/components/checkout/payment-section'
import { toast } from 'sonner'

type CheckoutStep = 'address' | 'review' | 'payment'

function CheckoutContent() {
  const router = useRouter()
  const { userId } = useAuth()
  const { user } = useUser()
  const { cart, derivedItems, summary, refreshCart } = useCart()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address')
  const [addresses, setAddresses] = useState<BusinessAddress[]>([])
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string | null>(null)
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string | null>(null)
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Load addresses and checkout summary
  useEffect(() => {
    async function loadCheckoutData() {
      if (!cart?.id) return

      setIsLoading(true)

      try {
        // Load addresses
        const addressResult = await getBusinessAddresses()
        if (addressResult.success && addressResult.data) {
          setAddresses(addressResult.data)

          // Auto-select default addresses
          const defaultShipping = addressResult.data.find(
            addr => addr.is_default && (addr.address_type === 'shipping' || addr.address_type === 'both')
          )
          if (defaultShipping) {
            setSelectedShippingAddress(defaultShipping.id!)
          }

          const defaultBilling = addressResult.data.find(
            addr => addr.is_default && (addr.address_type === 'billing' || addr.address_type === 'both')
          )
          if (defaultBilling) {
            setSelectedBillingAddress(defaultBilling.id!)
          }
        }

        // Load checkout summary
        const summaryResult = await getCheckoutSummary(cart.id)
        if (summaryResult.success && summaryResult.data) {
          setCheckoutSummary(summaryResult.data)
        }
      } catch (error) {
        console.error('Failed to load checkout data:', error)
        toast.error('Failed to load checkout data')
      } finally {
        setIsLoading(false)
      }
    }

    loadCheckoutData()
  }, [cart?.id])

  // Handle address updates
  const handleAddressesUpdate = async () => {
    const result = await getBusinessAddresses()
    if (result.success && result.data) {
      setAddresses(result.data)
    }
  }

  // Handle proceed to review
  const handleProceedToReview = () => {
    if (!selectedShippingAddress) {
      toast.error('Please select a shipping address')
      return
    }

    if (!useSameAddress && !selectedBillingAddress) {
      toast.error('Please select a billing address')
      return
    }

    setCurrentStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions')
      return
    }

    if (!cart?.id || !selectedShippingAddress) {
      toast.error('Missing required information')
      return
    }

    setIsProcessing(true)

    try {
      // Create order
      const result = await createOrderFromCart(
        cart.id,
        selectedShippingAddress,
        useSameAddress ? selectedShippingAddress : selectedBillingAddress || selectedShippingAddress
      )

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create order')
      }

      // Move to payment step with order details
      setCurrentStep('payment')
      toast.success('Order created successfully')
    } catch (error: any) {
      console.error('Order creation error:', error)
      toast.error(error.message || 'Failed to create order')
    } finally {
      setIsProcessing(false)
    }
  }

  // Progress indicator
  const steps = [
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'review', label: 'Review', icon: Package },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!checkoutSummary) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load checkout information</p>
          <Button onClick={() => router.push('/cart')}>Return to Cart</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="checkout-page">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex

            return (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    data-testid={`checkout-step-${step.id}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 mb-8 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Address Step */}
          {currentStep === 'address' && (
            <AddressSection
              addresses={addresses}
              selectedShippingAddress={selectedShippingAddress}
              selectedBillingAddress={selectedBillingAddress}
              useSameAddress={useSameAddress}
              onShippingAddressChange={setSelectedShippingAddress}
              onBillingAddressChange={setSelectedBillingAddress}
              onUseSameAddressChange={setUseSameAddress}
              onAddressesUpdate={handleAddressesUpdate}
            />
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Order</h2>

              {/* Selected Addresses */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                {selectedShippingAddress && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {addresses.find(a => a.id === selectedShippingAddress) && (
                      <div>
                        <p className="font-medium">{addresses.find(a => a.id === selectedShippingAddress)?.contact_name}</p>
                        <p className="text-sm text-gray-600">{addresses.find(a => a.id === selectedShippingAddress)?.address_line1}</p>
                        {addresses.find(a => a.id === selectedShippingAddress)?.address_line2 && (
                          <p className="text-sm text-gray-600">{addresses.find(a => a.id === selectedShippingAddress)?.address_line2}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {addresses.find(a => a.id === selectedShippingAddress)?.city}, {addresses.find(a => a.id === selectedShippingAddress)?.state} - {addresses.find(a => a.id === selectedShippingAddress)?.postal_code}
                        </p>
                        <p className="text-sm text-gray-600">{addresses.find(a => a.id === selectedShippingAddress)?.contact_phone}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {derivedItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      {item.unit_price > 0 && (
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1"
                    data-testid="terms-checkbox"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('address')}
                  className="flex-1"
                  data-testid="back-to-address-btn"
                >
                  Back to Address
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !termsAccepted}
                  className="flex-1"
                  data-testid="place-order-btn"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <PaymentSection
              cartId={cart?.id || ''}
              checkoutSummary={checkoutSummary}
              onSuccess={(orderId) => {
                router.push(`/order-confirmation?orderId=${orderId}`)
              }}
              onFailure={() => {
                router.push('/checkout/failure')
              }}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummarySection
            items={derivedItems}
            summary={checkoutSummary}
            currentStep={currentStep}
            onProceed={handleProceedToReview}
            canProceed={!!selectedShippingAddress && (useSameAddress || !!selectedBillingAddress)}
          />
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <CheckoutGuard>
      <CheckoutContent />
    </CheckoutGuard>
  )
}
