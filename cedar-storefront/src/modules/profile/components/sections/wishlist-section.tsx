'use client'

import { Heart, Share2, ShoppingCart, FileText, Trash2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useWishlistContext } from '@/lib/context/wishlist-context'
import { cn } from '@/lib/utils'

export default function WishlistSection() {
  const {
    lists,
    activeList,
    isLoading,
    itemCount,
    addAllToCart,
    requestQuote,
    clearList,
    shareList,
  } = useWishlistContext()

  const [shareToken, setShareToken] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  const handleShare = async () => {
    if (!activeList) return
    
    try {
      // Generate share token
      const token = await shareList(activeList.id, [], 'view')
      const shareUrl = `${window.location.origin}/wishlist/shared/${token}`
      setShareToken(shareUrl)
      setShowShareModal(true)
    } catch (error) {
      console.error('Error sharing wishlist:', error)
    }
  }

  const handleCopyShareLink = () => {
    if (shareToken) {
      navigator.clipboard.writeText(shareToken)
      // TODO: Show toast notification
    }
  }

  const handleAddAllToCart = async () => {
    if (!activeList) return
    
    try {
      await addAllToCart(activeList.id)
      // TODO: Show success notification
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleRequestQuote = async () => {
    if (!activeList) return
    
    try {
      await requestQuote(activeList.id)
      // TODO: Navigate to quote page or show success
    } catch (error) {
      console.error('Error requesting quote:', error)
    }
  }

  const handleClearList = async () => {
    if (!activeList) return
    
    const confirmed = window.confirm('Are you sure you want to clear your wishlist? This action cannot be undone.')
    if (!confirmed) return
    
    try {
      await clearList(activeList.id)
      // TODO: Show success notification
    } catch (error) {
      console.error('Error clearing wishlist:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-cedar-600" />
      </div>
    )
  }

  const hasItems = itemCount > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
          <p className="mt-1 text-sm text-gray-600">
            {hasItems ? `${itemCount} item${itemCount !== 1 ? 's' : ''} saved` : 'No items saved yet'}
          </p>
        </div>

        {hasItems && (
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={handleClearList}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!hasItems && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Your wishlist is empty</h3>
          <p className="mt-2 text-sm text-gray-600">
            Save items you love by clicking the heart icon on product pages
          </p>
          <a
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cedar-600 px-6 py-3 text-sm font-medium text-white hover:bg-cedar-700"
          >
            Browse Products
            <ExternalLink size={16} />
          </a>
        </div>
      )}

      {/* Wishlist Items */}
      {hasItems && activeList && (
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={handleAddAllToCart}
              className="flex items-center justify-center gap-2 rounded-lg border border-cedar-600 bg-cedar-50 px-6 py-3 text-sm font-medium text-cedar-700 hover:bg-cedar-100"
            >
              <ShoppingCart size={18} />
              Add All to Cart
            </button>
            <button
              onClick={handleRequestQuote}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText size={18} />
              Request Quote
            </button>
          </div>

          {/* Items List */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="divide-y divide-gray-200">
              {activeList.items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                    <Heart className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Product {item.variant_id}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {item.notes && (
                      <p className="mt-1 text-xs text-gray-500">{item.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Implement remove item
                    }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* View Full Wishlist Link */}
          <div className="text-center">
            <a
              href="/account/wishlist"
              className="inline-flex items-center gap-2 text-sm font-medium text-cedar-600 hover:text-cedar-700"
            >
              View Full Wishlist
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Share Your Wishlist</h3>
            <p className="mt-2 text-sm text-gray-600">
              Anyone with this link can view your wishlist
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={shareToken}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={handleCopyShareLink}
                className="rounded-lg bg-cedar-600 px-4 py-2 text-sm font-medium text-white hover:bg-cedar-700"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
