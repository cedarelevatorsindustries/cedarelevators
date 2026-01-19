'use client'

import { useState } from 'react'
import { Lock, ShieldCheck, Package, Minus, Plus, ShoppingCart, FileText, Truck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPricingState, getPricingPermissions, formatPrice, calculateDiscount, getPrimaryCTAUrl } from '@/lib/utils/pricing-utils'
import { useCartQuery } from '@/lib/hooks/use-cart-query'

interface PriceActionCardProps {
    userState: UserPricingState
    price?: number | null
    mrp?: number | null
    onAddToCart?: (quantity: number) => void
    onRequestQuote?: (quantity: number) => void
    className?: string
    isMobile?: boolean
    actionDisabled?: boolean
    productId?: string
    verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
}

export function PriceActionCard({
    userState,
    price,
    mrp,
    onAddToCart,
    onRequestQuote,
    className = '',
    isMobile = false,
    actionDisabled = false,
    productId,
    verificationStatus
}: PriceActionCardProps) {
    const [quantity, setQuantity] = useState(1)
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const router = useRouter()
    const { data: cart, isLoading: isCartLoading, refetch: refetchCart } = useCartQuery()
    const permissions = getPricingPermissions(userState)
    const discount = price && mrp ? calculateDiscount(price, mrp) : 0
    const primaryUrl = getPrimaryCTAUrl(userState)

    // Check if this product is in cart
    const isProductInCart = cart?.items?.some(
        item => item.product_id === productId
    ) ?? false

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta))
    }

    const handlePrimaryAction = async () => {
        if (userState === 'business_verified' && onAddToCart) {
            setIsAddingToCart(true)
            try {
                await onAddToCart(quantity)
                // Force refetch cart to update button state
                await refetchCart()
            } catch (error) {
                console.error('Error adding to cart:', error)
            } finally {
                setIsAddingToCart(false)
            }
        }
    }

    // Guest, Individual & Business Unverified States (No Price)
    if (!permissions.canViewPrice) {
        const isPending = userState === 'business_unverified' && verificationStatus === 'pending'

        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex flex-col gap-4">
                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            {isPending ? (
                                <div className="flex items-center justify-center w-12 h-12">
                                    <img
                                        src="/images/verification/verification_illustration.png"
                                        alt="Verification in progress"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600">
                                    <Lock className="w-5 h-5" />
                                </div>
                            )}
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                                {isPending ? 'Verification Pending' : userState === 'guest' ? 'Member Only' : userState === 'individual' ? 'Business Only' : 'Verification Required'}
                            </span>
                        </div>

                        {/* Headline */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">
                                {isPending ? 'Verification Under Review' : permissions.statusMessage}
                            </h2>
                            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                                {isPending
                                    ? 'Our team is reviewing your documents. You\'ll receive an email once approved (usually within 24 hours). Pricing will be available after approval.'
                                    : permissions.microCopy
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-4 flex flex-col gap-3">
                    {/* Primary Button - Hide when pending */}
                    {!isPending && primaryUrl ? (
                        <Link
                            href={primaryUrl}
                            className="group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-orange-500 h-11 px-4 text-white text-sm font-bold tracking-wide transition-all hover:bg-orange-600 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            <span className="truncate">{permissions.primaryCTA}</span>
                        </Link>
                    ) : null}

                    {/* Secondary Button */}
                    <button
                        onClick={() => onRequestQuote?.(1)}
                        className="flex w-full items-center justify-center overflow-hidden rounded-lg h-11 px-4 border border-gray-300 bg-transparent text-gray-700 text-sm font-bold tracking-wide transition-all hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]"
                    >
                        <span className="truncate">{permissions.secondaryCTA}</span>
                    </button>

                    {/* Helper Text */}
                    {userState === 'guest' && (
                        <div className="mt-2 text-center">
                            <p className="text-xs text-gray-600">
                                New here?{' '}
                                <Link
                                    href="/sign-up"
                                    className="text-orange-600 hover:text-orange-700 font-bold underline decoration-orange-600/30 underline-offset-2 hover:decoration-orange-600 transition-colors"
                                >
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Business Verified State (Full Access)
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            {/* Verified Header Stripe */}
            <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                    Verified Business Account
                </span>
            </div>

            <div className="p-6">
                {/* Pricing Section */}
                <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <h1 className="text-gray-900 text-3xl font-bold tracking-tight">
                            {formatPrice(price)}
                        </h1>
                        {mrp && mrp > (price || 0) && (
                            <>
                                <p className="text-gray-500 text-lg line-through">
                                    MRP {formatPrice(mrp)}
                                </p>
                                {discount > 0 && (
                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                                        -{discount}%
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">(Inclusive of all taxes)</p>
                </div>

                {/* Bulk Pricing Message */}
                {permissions.showBulkPricing && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-6 flex items-start gap-3 border border-gray-100">
                        <Package className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-gray-900 text-sm font-medium leading-tight">
                                Bulk pricing available
                            </p>
                            <p className="text-gray-600 text-xs mt-0.5">
                                Verified businesses save extra on qty &gt; 10
                            </p>
                        </div>
                    </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                    </label>
                    <div className="flex items-center w-[140px] border border-gray-200 rounded-lg bg-white">
                        <button
                            onClick={() => handleQuantityChange(-1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-orange-600 transition-colors hover:bg-gray-50 rounded-l-lg"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            value={quantity}
                            readOnly
                            className="w-full h-10 text-center text-gray-900 font-medium bg-transparent border-0 focus:ring-0 p-0 text-sm"
                        />
                        <button
                            onClick={() => handleQuantityChange(1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-orange-600 transition-colors hover:bg-gray-50 rounded-r-lg"
                            aria-label="Increase quantity"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
                    {isProductInCart ? (
                        <button
                            onClick={() => router.push('/cart')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Go to Cart
                        </button>
                    ) : (
                        <button
                            onClick={handlePrimaryAction}
                            disabled={actionDisabled || isAddingToCart}
                            className={`flex-1 font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${actionDisabled || isAddingToCart
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}
                        >
                            {isAddingToCart ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5" />
                                    {permissions.primaryCTA}
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => onRequestQuote?.(quantity)}
                        className="flex-1 bg-transparent hover:bg-orange-50 border border-gray-300 text-gray-800 font-medium py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <FileText className="w-5 h-5" />
                        {permissions.secondaryCTA}
                    </button>
                </div>

                {/* Delivery Info */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Truck className="w-4 h-4" />
                        <p className="text-xs">{permissions.microCopy}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
