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

export default function CartPage() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const {
    derivedItems,
    summary,
    isLoading,
    error,
    context,
    clearCartItems,
    switchProfile
  } = useCart()

  // Determine user type for display
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
  const hasBusinessProfile = user?.publicMetadata?.accountType === 'business'
  const currentProfileType = context?.profileType || 'individual'

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              {isSignedIn 
                ? 'Add products to your cart and they will appear here.'
                : 'Sign in to sync your cart across devices or continue shopping as guest.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/catalog">
                <Button size="lg">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Browse Products
                </Button>
              </Link>
              {!isSignedIn && (
                <Link href="/sign-in">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="cart-page">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="cart-title">
                Shopping Cart
              </h1>
              <p className="text-gray-600">
                {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'} 
                {summary.uniqueProducts > 1 && ` • ${summary.uniqueProducts} products`}
              </p>
            </div>

            {/* Profile Switcher (for business users with both profiles) */}
            {isSignedIn && hasBusinessProfile && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  Shopping as:
                </div>
                <Button
                  onClick={handleProfileSwitch}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="profile-switcher-btn"
                >
                  {currentProfileType === 'individual' ? (
                    <>
                      <User className="w-4 h-4" />
                      Individual
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      Business
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    userType={userType}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <CartSummary
              summary={summary}
              userType={userType}
              onCheckout={handleCheckout}
              onRequestQuote={handleRequestQuote}
            />
            
            {/* Alternative Quote Button for Authenticated Users */}
            {isSignedIn && derivedItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Need a Custom Quote?
                </h4>
                <p className="text-xs text-blue-700 mb-3">
                  Get personalized pricing and bulk discounts for your order
                </p>
                <QuoteFromCartButton
                  cartItems={derivedItems}
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="border-blue-300 hover:bg-blue-100 hover:border-blue-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

