/**
 * Cart Page
 * Cedar Elevator Industries
 * 
 * Main cart page with:
 * - Profile-scoped cart display
 * - Pricing visibility by user type
 * - Checkout/Quote CTAs
 * - Profile switcher
 */

'use client'

import { useCart } from '@/contexts/cart-context'
import { useAuth, useUser } from '@clerk/nextjs'
import { CartItemCard } from '@/components/cart/cart-item-card'
import { CartSummary } from '@/components/cart/cart-summary'
import { QuoteFromCartButton } from '@/components/cart/quote-from-cart-button'
import { ShoppingBag, ArrowLeft, User, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserType, ProfileType } from '@/types/cart.types'
import { useRouter } from 'next/navigation'
import EmptyCartState from '@/modules/cart/templates/empty-cart-state'
import { useUserPricing } from '@/lib/hooks/useUserPricing'
import { useEffect, useState } from 'react'
import { getShippingSettings } from '@/lib/services/settings'

export default function CartPage() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser() // Get isLoaded from enhanced user hook
  const {
    derivedItems,
    summary,
    isLoading,
    error,
    context,
    clearCartItems,
    switchProfile
  } = useCart()

  // Fetch shipping settings for delivery ETA
  const [deliveryEta, setDeliveryEta] = useState<string>('')

  useEffect(() => {
    const fetchShippingSettings = async () => {
      const result = await getShippingSettings()
      if (result.success && result.data?.delivery_sla_text) {
        setDeliveryEta(result.data.delivery_sla_text)
      }
    }
    fetchShippingSettings()
  }, [])

  // Use centralized user pricing hook for correct user type detection
  const { userType: pricingUserType, isVerified } = useUserPricing()

  // Debug logging - REMOVED


  // Map pricing user type to cart user type
  const getUserType = (): UserType => {
    if (!isSignedIn) return 'guest'
    if (pricingUserType === 'business' && isVerified) return 'business_verified'
    if (pricingUserType === 'business' && !isVerified) return 'business_unverified'
    return 'individual'
  }

  const userType = getUserType()
  const hasBusinessProfile = pricingUserType === 'business'
  const currentProfileType = context?.profileType || 'individual'

  console.log('[CartPage] Computed userType:', userType)

  // Simple loading check - just wait for basic user data
  // Don't wait for user.business since it may not load from enhanced hook
  const isDataReady = isUserLoaded && pricingUserType !== 'guest'

  // Redirect non-verified business users to catalog using useEffect
  // Only verified business users can access cart
  useEffect(() => {
    if (!isDataReady) {
      return
    }

    if (isSignedIn && userType !== 'business_verified') {
      router.push('/catalog')
    } else if (!isSignedIn) {
      router.push('/sign-in?redirect=/cart')
    }
  }, [isSignedIn, userType, router, isDataReady])

  // Don't render cart for non-verified users (but show loading while checking)
  if (!isDataReady || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isSignedIn && userType !== 'business_verified') {
    return null
  }

  if (!isSignedIn) {
    return null
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const handleRequestQuote = () => {
    router.push('/request-quote?source=cart')
  }

  const handleProfileSwitch = async () => {
    const newProfile: ProfileType = currentProfileType === 'individual' ? 'business' : 'individual'
    const businessId = user?.publicMetadata?.businessId as string | undefined
    await switchProfile(newProfile, businessId)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Cart</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/catalog">
            <Button>Return to Catalog</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (summary.itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyCartState />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <p className="text-gray-600 mt-2 mb-8">
          {summary.itemCount} items • {summary.uniqueProducts} products
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Clear Cart Button */}
              {summary.itemCount > 0 && (
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Items in Cart</h2>
                  <Button
                    onClick={clearCartItems}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                    data-testid="clear-cart-btn"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {/* Cart Items List */}
              <div className="divide-y" data-testid="cart-items-list">
                {derivedItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar - Sticky on Desktop */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 lg:self-start">
            <CartSummary
              summary={summary}
              onCheckout={handleCheckout}
              onRequestQuote={handleRequestQuote}
              deliveryEta={deliveryEta}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

