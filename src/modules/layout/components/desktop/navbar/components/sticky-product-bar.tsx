"use client"

import { ShoppingCart } from "lucide-react"
import Image from "next/image"

interface StickyProductBarProps {
  isVisible: boolean
  product?: {
    thumbnail?: string
    title: string
    price: string
  }
  onAddToCart?: () => void
}

export function StickyProductBar({ isVisible, product, onAddToCart }: StickyProductBarProps) {
  if (!isVisible || !product) return null

  return (
    <div 
      className={`fixed top-[70px] inset-x-0 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      style={{ zIndex: 999 }}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Product Info */}
          <div className="flex items-center gap-4">
            {product.thumbnail && (
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                {product.title}
              </h3>
              <p className="text-sm font-medium text-blue-600">
                {product.price}
              </p>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

