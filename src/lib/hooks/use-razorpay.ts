'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

/**
 * Custom hook for Razorpay payment integration
 * Handles payment flow from order creation to verification
 */
export function useRazorpay() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  console.log('🎣 [useRazorpay] Hook initialized')
  
  /**
   * Load Razorpay script dynamically
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    console.log('📦 [useRazorpay] Loading Razorpay script...')
    
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        console.log('✅ [useRazorpay] Razorpay script already loaded')
        resolve(true)
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      
      script.onload = () => {
        console.log('✅ [useRazorpay] Razorpay script loaded successfully')
        resolve(true)
      }
      
      script.onerror = () => {
        console.error('❌ [useRazorpay] Failed to load Razorpay script')
        resolve(false)
      }
      
      document.body.appendChild(script)
    })
  }
  
  /**
   * Initiate payment flow
   * 
   * @param orderId - Database order ID
   * @param amount - Payment amount in INR
   * @param userDetails - Optional user details for prefill
   */
  const initiatePayment = async (
    orderId: string,
    amount: number,
    userDetails?: {
      name?: string
      email?: string
      contact?: string
    }
  ) => {
    console.log('💳 [useRazorpay] Initiating payment...')
    console.log('💳 [useRazorpay] Order ID:', orderId)
    console.log('💳 [useRazorpay] Amount: ₹', amount)
    
    try {
      setLoading(true)
      setError(null)
      
      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please refresh and try again.')
      }
      
      console.log('📡 [useRazorpay] Creating Razorpay order...')
      
      // Step 2: Create Razorpay order via API
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        console.error('❌ [useRazorpay] Failed to create Razorpay order:', data.error)
        throw new Error(data.error || 'Failed to create payment order')
      }
      
      console.log('✅ [useRazorpay] Razorpay order created:', data.razorpayOrderId)
      
      // Step 3: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: 'Cedar Elevators',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          console.log('✅ [useRazorpay] Payment successful')
          console.log('✅ [useRazorpay] Payment ID:', response.razorpay_payment_id)
          
          try {
            // Step 4: Verify payment
            console.log('🔐 [useRazorpay] Verifying payment...')
            
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            
            const verifyData = await verifyResponse.json()
            
            if (verifyData.success) {
              console.log('🎉 [useRazorpay] Payment verified successfully')
              
              toast.success('Payment successful! 🎉', {
                description: 'Your order has been confirmed.',
              })
              
              // Redirect to order confirmation page
              router.push(`/order-confirmation?orderId=${orderId}`)
            } else {
              console.error('❌ [useRazorpay] Payment verification failed:', verifyData.error)
              
              toast.error('Payment verification failed', {
                description: verifyData.error || 'Please contact support.',
              })
            }
          } catch (verifyError: any) {
            console.error('❌ [useRazorpay] Verification error:', verifyError)
            
            toast.error('Payment verification error', {
              description: 'Please contact support with your payment details.',
            })
          }
        },
        prefill: userDetails ? {
          name: userDetails.name || '',
          email: userDetails.email || '',
          contact: userDetails.contact || '',
        } : undefined,
        theme: {
          color: '#F97316', // Orange theme matching Cedar Elevators
        },
        modal: {
          ondismiss: () => {
            console.log('⚠️ [useRazorpay] Payment cancelled by user')
            
            toast.info('Payment cancelled', {
              description: 'You can complete the payment anytime from your orders.',
            })
            
            setLoading(false)
          },
        },
      }
      
      console.log('🎨 [useRazorpay] Opening Razorpay checkout...')
      
      const rzp = new window.Razorpay(options)
      
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ [useRazorpay] Payment failed')
        console.error('❌ [useRazorpay] Error:', response.error)
        
        const errorMessage = response.error?.description || 
                            response.error?.reason || 
                            'Payment failed'
        
        toast.error('Payment failed', {
          description: errorMessage,
        })
        
        setError(errorMessage)
        setLoading(false)
      })
      
      rzp.open()
      
      // Don't set loading to false here, it will be set after payment completion or dismissal
      
    } catch (error: any) {
      console.error('❌ [useRazorpay] Payment initiation error:', error)
      
      const errorMessage = error.message || 'Payment initiation failed'
      setError(errorMessage)
      
      toast.error('Payment error', {
        description: errorMessage,
      })
      
      setLoading(false)
    }
  }
  
  /**
   * Reset error state
   */
  const clearError = () => {
    console.log('🧹 [useRazorpay] Clearing error')
    setError(null)
  }
  
  return {
    initiatePayment,
    loading,
    error,
    clearError,
  }
}
