'use client'

import { X } from 'lucide-react'
import ProductCard from '@/components/ui/product-card'
import { useWishlist } from '@/lib/hooks/use-wishlist'
import { toast } from 'sonner'
import { useState } from 'react'
import type { Product } from '@/lib/types/domain'

interface WishlistProductCardProps {
    product: Product
    variantId: string
    wishlistItemId: string
}

export function WishlistProductCard({ product, variantId, wishlistItemId }: WishlistProductCardProps) {
    const { removeItem } = useWishlist()
    const [isRemoving, setIsRemoving] = useState(false)

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setIsRemoving(true)
        try {
            await removeItem(variantId)
            toast.success('Removed from wishlist')
        } catch (error) {
            console.error('Error removing from wishlist:', error)
            toast.error('Failed to remove item')
        } finally {
            setIsRemoving(false)
        }
    }

    return (
        <div className="relative group">
            <ProductCard product={product} variant="default" />

            {/* Delete Button - Top Left Corner */}
            <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="absolute top-5 left-5 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove from wishlist"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
