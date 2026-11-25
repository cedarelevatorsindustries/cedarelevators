'use client'

import Link from 'next/link'
import { Bookmark, Package, ArrowRight, Trash2, Minus, Plus } from 'lucide-react'
import { useWishlist } from '@/lib/hooks/use-wishlist'
import { toast } from 'sonner'
import { useState } from 'react'
import type { Product } from '@/lib/types/domain'

interface WishlistProductCardProps {
  product: Product
  variantId: string
  wishlistItemId: string
  quantity?: number
  sku?: string | null
  variantTitle?: string | null
}

export function WishlistProductCard({
  product,
  variantId,
  wishlistItemId,
  quantity = 1,
  sku,
  variantTitle,
}: WishlistProductCardProps) {
  const { removeItem, updateQuantity } = useWishlist()
  const [isRemoving, setIsRemoving] = useState(false)

  const rawPrice =
    (product as any).price ||
    product.variants?.[0]?.calculated_price?.calculated_amount ||
    product.variants?.[0]?.price ||
    0
  const price = typeof rawPrice === 'number' ? rawPrice : 0
  const formattedPrice = price > 0 ? `₹${Number(price).toLocaleString('en-IN')}` : null
  const productHref = product.handle ? `/products/${product.handle}` : '/products'

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsRemoving(true)
    try {
      await removeItem(variantId)
    } catch (error) {
      console.error('Error removing from quote list:', error)
      toast.error('Failed to remove product')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleQuantityChange = async (nextQty: number) => {
    const safeQty = Math.min(10000, Math.max(1, nextQty))
    if (safeQty === quantity) return
    try {
      await updateQuantity(wishlistItemId, safeQty)
    } catch {
      // handled in mutation
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col justify-between transition-colors">
      {/* Product Image */}
      <Link href={productHref} className="block aspect-square bg-gray-50 rounded-xl relative overflow-hidden mb-4">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title || 'Product'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Saved Bookmark Toggle (Click to Remove) */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label="Remove from quote list"
          title="Remove from quote list"
          className="absolute top-2.5 right-2.5 bg-white/95 rounded-full p-2 shadow-sm hover:bg-white transition-colors disabled:opacity-50"
        >
          <Bookmark fill="currentColor" className="w-4 h-4 fill-orange-600 text-orange-600" />
        </button>
      </Link>

      {/* Product Details */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <Link href={productHref} className="block">
            <h3 className="type-product text-gray-900 line-clamp-2 hover:text-orange-600 transition-colors">
              {product.title}
            </h3>
          </Link>

          <div className="mt-1.5 space-y-0.5 text-xs text-gray-500">
            {sku && <p className="font-mono">SKU: {sku}</p>}
            {variantTitle && <p className="text-gray-700">Variant: {variantTitle}</p>}
          </div>

          <div className="mt-2">
            {formattedPrice ? (
              <p className="text-base text-gray-900">{formattedPrice}</p>
            ) : (
              <p className="type-body-sm text-orange-600">Price on request</p>
            )}
          </div>
        </div>

        {/* Quantity Control */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-medium">Quantity</span>
          <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="p-1.5 text-gray-600 hover:text-orange-600 disabled:opacity-40"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min={1}
              max={10000}
              value={quantity}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10)
                if (!isNaN(parsed) && parsed >= 1) {
                  handleQuantityChange(parsed)
                }
              }}
              aria-label="Quantity"
              className="w-12 text-center text-xs font-medium bg-transparent border-0 focus:outline-none text-gray-900"
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              aria-label="Increase quantity"
              className="p-1.5 text-gray-600 hover:text-orange-600"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Actions: View Product & Remove */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <Link
            href={productHref}
            className="type-button inline-flex items-center gap-1.5 text-sm text-gray-900 hover:text-orange-600 transition-colors"
          >
            <span>View product</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isRemoving ? 'Removing...' : 'Remove'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
