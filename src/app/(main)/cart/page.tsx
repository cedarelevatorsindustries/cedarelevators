"use client"

import { useCart } from "@/lib/hooks"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function CartPage() {
  const { items, itemCount, cart, updateQuantity, removeItem, isLoading } = useCart()
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setLoadingItems(prev => new Set(prev).add(lineId))
    try {
      await updateQuantity(lineId, newQuantity)
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(lineId)
        return next
      })
    }
  }

  const handleRemove = async (lineId: string) => {
    setLoadingItems(prev => new Set(prev).add(lineId))
    try {
      await removeItem(lineId)
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(lineId)
        return next
      })
    }
  }

  const formatPrice = (amount: number) => {
    return `₹${(amount / 100).toLocaleString("en-IN")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (items.length === 0) {
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
              Add products to your cart and they will appear here.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isItemLoading = loadingItems.has(item.id)
              
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-6 shadow-sm ${
                    isItemLoading ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xl font-bold text-gray-900 mb-4">
                        {formatPrice(item.unit_price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isItemLoading || item.quantity <= 1}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isItemLoading}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={isItemLoading}
                          className="ml-auto flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(cart?.subtotal || 0)}</span>
                </div>
                {(cart?.discount_total ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(cart?.discount_total ?? 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {(cart?.shipping_total ?? 0) > 0 ? formatPrice(cart?.shipping_total ?? 0) : "Calculated at checkout"}
                  </span>
                </div>
                {(cart?.tax_total ?? 0) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold">{formatPrice(cart?.tax_total ?? 0)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(cart?.total || 0)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors mb-3"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/catalog"
                className="block w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <p>✓ Secure checkout</p>
                <p>✓ Free shipping on orders above ₹50,000</p>
                <p>✓ 2-year warranty included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
