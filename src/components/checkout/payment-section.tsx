/**
 * Payment Section Component
 * Handles Razorpay payment integration
 */

'use client'

import { useState, useEffect } from 'react'
import { CheckoutSummary } from '@/lib/actions/checkout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/cart-context'

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentSectionProps {
  cartId: string
  checkoutSummary: CheckoutSummary
  onSuccess: (orderId: string) => void
  onFailure: () => void
}

export function PaymentSection({
  cartId,
  checkoutSummary,
  onSuccess,
  onFailure,
}: PaymentSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const { refreshCart } = useCart()

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => {
      toast.error('Failed to load payment gateway')
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast.error('Payment gateway not ready. Please try again.')
      return
    }

    setIsProcessing(true)

    // EDGE CASE: Payment timeout handler
    const timeoutId = setTimeout(() => {
      if (isProcessing) {
        setIsProcessing(false)
        toast.error('Payment gateway timeout. Please try again.')
      }
    }, 300000) // 5 minutes timeout

    try {
      // Step 1: Create Razorpay order via our API
      const createOrderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cartId, // Using cart ID temporarily, will be replaced with actual order ID
          amount: checkoutSummary.total,
        }),
      })

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json()
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      const orderData = await createOrderResponse.json()

      if (!orderData.razorpayOrderId) {
        throw new Error('Invalid payment order response')
      }

      // Step 2: Initialize Razorpay checkout
      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Cedar Elevators',
        description: 'Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          // Clear timeout on successful payment
          clearTimeout(timeoutId)
          
          // Step 3: Verify payment on our server
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: cartId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }

            const verifyData = await verifyResponse.json()

            // Refresh cart to update status
            await refreshCart()

            toast.success('Payment successful!')
            onSuccess(verifyData.order?.id || cartId)
          } catch (error: any) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed')
            onFailure()
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: function () {
            clearTimeout(timeoutId)
            setIsProcessing(false)
            toast.info('Payment cancelled')
          },
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#ea580c', // Orange color
        },
        // EDGE CASE: Add timeout configuration
        timeout: 300, // 5 minutes in seconds
      }

      const razorpay = new window.Razorpay(options)
      
      // Handle payment failures
      razorpay.on('payment.failed', function (response: any) {
        clearTimeout(timeoutId)
        console.error('Payment failed:', response.error)
        toast.error(response.error.description || 'Payment failed')
        setIsProcessing(false)
      })
      
      razorpay.open()
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('Payment error:', error)
      toast.error(error.message || 'Failed to initiate payment')
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-6" data-testid="payment-section">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>

      {/* Payment Gateway Info */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900">Secure Payment</p>
            <p className="text-sm text-blue-700">Your payment information is encrypted and secure</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Lock className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Powered by Razorpay</p>
            <p className="text-sm text-green-700">India's most trusted payment gateway</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Payment Methods:</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg text-center">
            <CreditCard className="w-6 h-6 mx-auto mb-1 text-gray-600" />
            <p className="text-xs text-gray-600">Cards</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl mb-1">📱</div>
            <p className="text-xs text-gray-600">UPI</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl mb-1">🏦</div>
            <p className="text-xs text-gray-600">Net Banking</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl mb-1">💳</div>
            <p className="text-xs text-gray-600">Wallets</p>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Amount to Pay</span>
          <span className="text-2xl font-bold text-gray-900">
            ₹{checkoutSummary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing || !scriptLoaded}
        className="w-full"
        size="lg"
        data-testid="pay-now-btn"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay Securely
          </>
        )}
      </Button>

      {/* Security Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By clicking "Pay Securely", you agree to our terms and conditions.
          Your payment is protected by 256-bit SSL encryption.
        </p>
      </div>
    </Card>
  )
}

