"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useCart } from '@/lib/hooks'
import { useAccountType } from '@/lib/hooks'
import type {
  CheckoutState,
  CheckoutContextValue,
  OrderSummary,
  UserCheckoutType,
  CheckoutStep
} from '../types'

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

const STEP_ORDER: CheckoutStep[] = ['email_capture', 'blocked', 'shipping', 'payment', 'review', 'confirmation']

function determineUserCheckoutType(
  isGuest: boolean,
  isBusiness: boolean,
  isVerified: boolean
): UserCheckoutType {
  if (isGuest) return 'guest'
  if (!isBusiness) return 'individual'
  return isVerified ? 'business_verified' : 'business_unverified'
}

function canShowPrices(userType: UserCheckoutType): boolean {
  return userType === 'business_verified'
}

interface CheckoutProviderProps {
  children: ReactNode
}

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const { cart, items } = useCart()
  const { isGuest, isBusiness, user } = useAccountType()

  // Check if business is verified (from metadata)
  const isVerified = user?.publicMetadata?.verified === true ||
    user?.unsafeMetadata?.verified === true

  const userType = determineUserCheckoutType(isGuest, isBusiness, isVerified)
  const showPrices = canShowPrices(userType)

  // Determine initial step based on user type
  const getInitialStep = (): CheckoutStep => {
    if (userType === 'guest') return 'email_capture'
    if (userType === 'individual' || userType === 'business_unverified') return 'blocked'
    return 'shipping'
  }

  const [state, setState] = useState<CheckoutState>({
    step: getInitialStep(),
    userType,
    sameAsShipping: true,
    termsAccepted: false,
  })

  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate order summary
  // Note: Cart type doesn't include totals, we need to calculate them
  // For now, map items and calculate simple totals
  const subtotal = 0 // Would need product prices joined - not available in current CartItem type
  const tax = subtotal * 0.18 // 18% GST
  const shipping = 0
  const discount = 0
  const total = subtotal + tax + shipping - discount

  const orderSummary: OrderSummary = {
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail || null,
      quantity: item.quantity,
      unitPrice: 0, // CartItem doesn't have price - would need to join with products table
      subtotal: 0,
    })),
    subtotal,
    discount,
    shipping,
    tax,
    bulkDiscount: 0,
    total,
    showPrices,
  }

  const updateState = useCallback((updates: Partial<CheckoutState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => {
      const currentIndex = STEP_ORDER.indexOf(prev.step)
      const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1)
      return { ...prev, step: STEP_ORDER[nextIndex] }
    })
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => {
      const currentIndex = STEP_ORDER.indexOf(prev.step)
      const prevIndex = Math.max(currentIndex - 1, 0)
      return { ...prev, step: STEP_ORDER[prevIndex] }
    })
  }, [])

  // Validation for proceeding
  const canProceed = (() => {
    switch (state.step) {
      case 'email_capture':
        return !!(state.email && state.phone)
      case 'shipping':
        return !!state.shippingAddress
      case 'payment':
        return !!state.paymentMethod
      case 'review':
        return state.termsAccepted
      default:
        return false
    }
  })()

  const placeOrder = async () => {
    if (!canProceed || userType !== 'business_verified') return

    setIsProcessing(true)
    try {
      // Implement actual order placement via Supabase
      await new Promise(resolve => setTimeout(resolve, 2000))
      updateState({ step: 'confirmation' })
    } catch (error) {
      console.error('Order placement failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const requestQuote = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implement quote request
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateState({ step: 'confirmation' })
    } catch (error) {
      console.error('Quote request failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <CheckoutContext.Provider value={{
      state,
      orderSummary,
      updateState,
      nextStep,
      prevStep,
      canProceed,
      isProcessing,
      placeOrder,
      requestQuote,
    }}>
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider')
  }
  return context
}

