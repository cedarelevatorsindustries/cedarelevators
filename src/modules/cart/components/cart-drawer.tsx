"use client"

import { useCart } from "@/contexts/cart-context"
import { useAuth, useUser } from "@clerk/nextjs"
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { UserType, canSeePrice } from "@/types/cart.types"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { derivedItems, summary, updateQuantity, removeItem } = useCart()
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  // Determine user type
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
  const showPrice = canSeePrice(userType)

  const handleUpdateQuantity = async (
    itemId: string,
    productId: string,
    newQuantity: number,
    variantId?: string
  ) => {
    if (newQuantity < 1) return
    setLoadingItems(prev => new Set(prev).add(itemId))
    try {
      await updateQuantity(itemId, productId, newQuantity, variantId)
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleRemove = async (
    itemId: string,
    productId: string,
    variantId?: string
  ) => {
    setLoadingItems(prev => new Set(prev).add(itemId))
    try {
      await removeItem(itemId, productId, variantId)
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Shopping Cart ({summary.itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {derivedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">Your cart is empty</p>
              <button
                onClick={onClose}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {derivedItems.map((item) => {
                const isLoading = loadingItems.has(item.id)
                
                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-3 bg-gray-50 rounded-lg ${
                      isLoading ? "opacity-50" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      {showPrice && item.is_available ? (
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{item.unit_price.toLocaleString('en-IN')}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          {userType === 'guest' ? 'Sign in to view price' : 'Verify to view price'}
                        </p>
                      )}

                      {!item.is_available && (
                        <p className="text-xs text-red-600 mt-1">Unavailable</p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.product_id, item.quantity - 1, item.variant_id || undefined)}
                          disabled={isLoading || item.quantity <= 1 || !item.is_available}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.product_id, item.quantity + 1, item.variant_id || undefined)}
                          disabled={isLoading || !item.stock_available || !item.is_available}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemove(item.id, item.product_id, item.variant_id || undefined)}
                          disabled={isLoading}
                          className="ml-auto p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {derivedItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal:</span>
              <span>{formatPrice(cart?.subtotal || 0)}</span>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
