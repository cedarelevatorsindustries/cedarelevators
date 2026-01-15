"use client"

import { useState } from "react"
import { useCart } from "@/lib/hooks/use-cart"
import { useWishlist } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Loader2, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { toast } from "sonner"
import type { WishlistItem } from "@/lib/hooks/use-wishlist"

interface WishlistSummaryProps {
    items: WishlistItem[]
}

export function WishlistSummary({ items }: WishlistSummaryProps) {
    const { addItem } = useCart()
    const { clearWishlist } = useWishlist()
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [isClearing, setIsClearing] = useState(false)

    const subtotal = items.reduce((sum, item) => {
        return sum + (item.price || 0) * (item.quantity || 1)
    }, 0)

    const handleAddAllToCart = async () => {
        if (items.length === 0) return

        setIsAddingToCart(true)
        let addedCount = 0
        let errorCount = 0

        try {
            // Add items sequentially to avoid race conditions with cart updates if backend doesn't support bulk
            // Ideally backend should support bulk add, but we'll loop for now
            for (const item of items) {
                try {
                    // addItem now requires productId as first param
                    if (item.product_id) {
                        await addItem(item.product_id, item.variant_id || undefined, item.quantity || 1)
                        addedCount++
                    }
                } catch (err) {
                    console.error(`Failed to add item ${item.id} to cart`, err)
                    errorCount++
                }
            }

            if (addedCount > 0) {
                toast.success(`Added ${addedCount} items to cart`)
            }

            if (errorCount > 0) {
                toast.error(`Failed to add ${errorCount} items to cart`)
            }

        } catch (error) {
            toast.error("Something went wrong adding to cart")
        } finally {
            setIsAddingToCart(false)
        }
    }

    const handleClearWishlist = async () => {
        if (!confirm("Are you sure you want to remove all items from your wishlist?")) return;

        setIsClearing(true)
        try {
            await clearWishlist()
            toast.success("Wishlist cleared")
        } catch (err) {
            toast.error("Failed to clear wishlist")
        } finally {
            setIsClearing(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price)
    }

    return (
        <>
            {/* Desktop Card */}
            <div className="hidden lg:block bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Summary</h2>

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Subtotal ({items.length} items)</span>
                        <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-semibold text-lg">Total</span>
                            <span className="font-bold text-xl text-orange-600">{formatPrice(subtotal)}</span>
                        </div>

                        <Button
                            className="w-full mb-3 bg-orange-600 hover:bg-orange-700 text-white"
                            size="lg"
                            onClick={handleAddAllToCart}
                            disabled={isAddingToCart || items.length === 0}
                        >
                            {isAddingToCart ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Add All to Cart
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={handleClearWishlist}
                            disabled={isClearing || items.length === 0}
                        >
                            {isClearing ? "Clearing..." : "Clear Wishlist"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 safe-area-bottom">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500">Total ({items.length} items)</p>
                        <p className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</p>
                    </div>
                    <Button
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        size="lg"
                        onClick={handleAddAllToCart}
                        disabled={isAddingToCart || items.length === 0}
                    >
                        {isAddingToCart ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Add to Cart
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </>
    )
}
