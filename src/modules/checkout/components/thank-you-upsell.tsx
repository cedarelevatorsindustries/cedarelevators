"use client"

import { ShoppingBag, ArrowRight, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  thumbnail: string | null
  price: number
  originalPrice?: number
}

interface ThankYouUpsellProps {
  recommendedProducts: Product[]
  orderedProducts: Product[]
  showPrices: boolean
  onReorder?: () => void
}

export default function ThankYouUpsell({
  recommendedProducts,
  orderedProducts,
  showPrices,
  onReorder,
}: ThankYouUpsellProps) {
  const formatPrice = (amount: number) => {
    if (!showPrices) return '₹XX,XXX'
    return `₹${(amount / 100).toLocaleString('en-IN')}`
  }

  return (
    <div className="space-y-8">
      {/* Reorder Section */}
      {orderedProducts.length > 0 && onReorder && (
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-blue-900">Quick Reorder</h3>
            <button
              onClick={onReorder}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reorder Same Items
            </button>
          </div>
          <p className="text-sm text-blue-700">
            Need the same products again? Reorder with one click.
          </p>
        </div>
      )}

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">You Might Also Need</h3>
            <Link 
              href="/catalog" 
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedProducts.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {product.thumbnail ? (
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Accessories Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-2">Complete Your Installation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Don't forget essential accessories and installation tools for your elevator components.
        </p>
        <Link
          href="/catalog?category=accessories"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white 
            rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
        >
          Browse Accessories
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

