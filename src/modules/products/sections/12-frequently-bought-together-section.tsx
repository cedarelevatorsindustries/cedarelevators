"use client"

import { useState } from "react"
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { ShoppingCart, Check, Package, Heart, MessageSquare } from "lucide-react"
import { useUser } from "@/lib/auth/client"

interface FrequentlyBoughtTogetherSectionProps {
  mainProduct: Product
  bundleProducts: Product[]
  onAddBundle?: () => void
  isMobile?: boolean
}

export default function FrequentlyBoughtTogetherSection({
  mainProduct,
  bundleProducts,
  onAddBundle,
  isMobile = false
}: FrequentlyBoughtTogetherSectionProps) {
  const { user } = useUser()

  if (bundleProducts.length === 0) return null

  // Show up to 4 bundle products for mobile, 3 for desktop
  const limitedBundleProducts = bundleProducts.slice(0, isMobile ? 3 : 3)

  // All products including main product
  const allProducts = [mainProduct, ...limitedBundleProducts]

  // State for selected products (all selected by default)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(allProducts.map(p => p.id))
  )

  // User type and pricing logic
  const isGuest = !user
  const accountType = user?.unsafeMetadata?.accountType as string | undefined
  const isBusiness = accountType === "business"
  const isVerified = user?.unsafeMetadata?.is_verified === true
  const showPrice = isBusiness && isVerified

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  // Calculate total price for selected products
  const totalPrice = allProducts.reduce((sum, product) => {
    if (selectedProducts.has(product.id)) {
      return sum + (product.variants?.[0]?.calculated_price?.calculated_amount || 0)
    }
    return sum
  }, 0)

  const selectedCount = selectedProducts.size

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${isMobile ? 'p-4' : 'p-6 lg:p-8'}`}>
      <h2 className={`font-bold text-gray-900 mb-6 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
        Frequently Bought Together
      </h2>

      {/* Products Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-6`}>
        {allProducts.map((product) => {
          const productPrice = product.variants?.[0]?.calculated_price?.calculated_amount || 0
          const formattedPrice = productPrice ? `₹${Number(productPrice).toLocaleString("en-IN")}` : null
          const isSelected = selectedProducts.has(product.id)

          return (
            <div key={product.id} className="group relative bg-gray-50 rounded-xl p-3 hover:shadow-lg transition-all duration-300">
              {/* Product Image */}
              <div className={`aspect-square bg-white rounded-xl relative overflow-hidden mb-3 shadow-sm transition-opacity ${!isSelected ? 'opacity-40' : ''
                }`}>
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Checkbox - Inside Image, Top Left */}
                <button
                  onClick={() => toggleProduct(product.id)}
                  className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-md ${isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white/90 border-gray-300 hover:border-blue-400'
                    }`}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>

              {/* Product Content */}
              <div className={`space-y-2 transition-opacity ${!isSelected ? 'opacity-40' : ''}`}>
                {/* Title */}
                <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 line-clamp-2 leading-tight`}>
                  {product.title}
                </h3>

                {/* Description - Always show for all cards */}
                <p className={`text-gray-600 line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'} min-h-[2.5rem]`}>
                  {product.description || "High-quality product for your needs"}
                </p>

                {/* Price - Only for verified business users */}
                {showPrice && formattedPrice && (
                  <p className={`font-bold text-gray-900 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                    {formattedPrice}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add to Bundle Bar - Fixed at Bottom */}
      {selectedCount > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
              </p>
              {showPrice && totalPrice > 0 ? (
                <p className="text-2xl font-bold text-gray-900">
                  ₹{Number(totalPrice).toLocaleString("en-IN")}
                </p>
              ) : (
                <p className="text-lg font-semibold text-orange-600">
                  Request Quote for Bundle
                </p>
              )}
            </div>

            <button
              onClick={onAddBundle}
              className="bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 px-6 py-3 shadow-lg text-sm"
            >
              <ShoppingCart className="w-5 h-5" />
              Add Bundle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

