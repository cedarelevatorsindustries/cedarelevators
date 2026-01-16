'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth/client'
import { useWishlist } from '@/lib/hooks/use-wishlist'
import { Button } from '@/components/ui/button'
import { ShoppingCart, MessageSquare, LogIn, Loader2 } from 'lucide-react'
import { getUserPricingState } from '@/lib/utils/pricing-utils'
import { toast } from 'sonner'
import type { WishlistItem } from '@/lib/hooks/use-wishlist'

interface WishlistActionsProps {
    items: WishlistItem[]
}

export function WishlistActions({ items }: WishlistActionsProps) {
    const { user } = useUser()
    const router = useRouter()
    const { clearWishlist } = useWishlist()
    const [isProcessing, setIsProcessing] = useState(false)

    const userState = getUserPricingState(user)
    const isGuest = userState === 'guest'
    const isIndividual = userState === 'individual'
    const isBusinessUnverified = userState === 'business_unverified'
    const isBusinessVerified = userState === 'business_verified'

    const handleAddAllToCart = async () => {
        if (items.length === 0) return

        setIsProcessing(true)
        try {
            // TODO: Implement bulk add to cart
            toast.success('Adding items to cart...')
            router.push('/cart')
        } catch (error) {
            toast.error('Failed to add items to cart')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleAddAllToQuote = async () => {
        if (items.length === 0) return

        setIsProcessing(true)
        try {
            // Build quote URL with all product IDs
            const productIds = items.map(item => item.product_id).join(',')
            router.push(`/quotes/new?productIds=${productIds}`)
        } catch (error) {
            toast.error('Failed to create quote')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleLogin = () => {
        router.push('/sign-in?redirect=/wishlist')
    }

    return (
        <>
            {/* Desktop Actions */}
            <div className="hidden lg:block bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>

                <div className="space-y-3">
                    {isGuest && (
                        <>
                            <p className="text-sm text-gray-600 mb-4">
                                Login to proceed with bulk quote or checkout
                            </p>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                size="lg"
                                onClick={handleLogin}
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Login to Continue
                            </Button>
                        </>
                    )}

                    {isIndividual && (
                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            size="lg"
                            onClick={handleAddAllToQuote}
                            disabled={isProcessing || items.length === 0}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Add All to Quote
                                </>
                            )}
                        </Button>
                    )}

                    {isBusinessUnverified && (
                        <>
                            <p className="text-sm text-amber-600 mb-4">
                                Complete verification to unlock checkout
                            </p>
                            <Button
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                size="lg"
                                onClick={handleAddAllToQuote}
                                disabled={isProcessing || items.length === 0}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Add All to Quote
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {isBusinessVerified && (
                        <>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                size="lg"
                                onClick={handleAddAllToCart}
                                disabled={isProcessing || items.length === 0}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Add All to Cart
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                                size="lg"
                                onClick={handleAddAllToQuote}
                                disabled={isProcessing || items.length === 0}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Add All to Quote
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Fixed Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 safe-area-bottom">
                <div className="flex gap-3">
                    {isGuest && (
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            size="lg"
                            onClick={handleLogin}
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Login
                        </Button>
                    )}

                    {(isIndividual || isBusinessUnverified) && (
                        <Button
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                            size="lg"
                            onClick={handleAddAllToQuote}
                            disabled={isProcessing || items.length === 0}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Quote All
                                </>
                            )}
                        </Button>
                    )}

                    {isBusinessVerified && (
                        <>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                size="lg"
                                onClick={handleAddAllToCart}
                                disabled={isProcessing || items.length === 0}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Cart
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                className="flex-1 border-orange-300 text-orange-600"
                                size="lg"
                                onClick={handleAddAllToQuote}
                                disabled={isProcessing || items.length === 0}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Quote
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
