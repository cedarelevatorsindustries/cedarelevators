"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Plus, ShoppingCart, Check } from "lucide-react"

interface FrequentlyBoughtTogetherSectionProps {
  mainProduct: HttpTypes.StoreProduct
  bundleProducts: HttpTypes.StoreProduct[]
  onAddBundle?: () => void
  isMobile?: boolean
}

export default function FrequentlyBoughtTogetherSection({
  mainProduct,
  bundleProducts,
  onAddBundle,
  isMobile = false
}: FrequentlyBoughtTogetherSectionProps) {
  if (bundleProducts.length === 0) return null

  // Limit to 2 bundle products (total 3 with main product)
  const limitedBundleProducts = bundleProducts.slice(0, 2)
  
  // All products including main product
  const allProducts = [mainProduct, ...limitedBundleProducts]
  
  // State for selected products (all selected by default)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(allProducts.map(p => p.id))
  )

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      // Don't allow deselecting if it's the only one left
      if (newSelected.size > 1) {
        newSelected.delete(productId)
      }
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
    <div className={`bg-white rounded-xl ${isMobile ? 'p-4' : 'p-6 lg:p-8'}`}>
      <h2 className={`font-bold text-gray-900 mb-4 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
        Frequently Bought Together
      </h2>
      
      {/* Products Row with Checkboxes */}
      <div className={`flex items-center gap-3 mb-4 overflow-x-auto pb-4 ${isMobile ? '-mx-4 px-4' : ''}`}>
        {allProducts.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3 flex-shrink-0">
            {index > 0 && <Plus className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-gray-400 flex-shrink-0`} />}
            
            <div className={`${isMobile ? 'w-24' : 'w-32'} relative`}>
              {/* Checkbox Overlay */}
              <button
                onClick={() => toggleProduct(product.id)}
                className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  selectedProducts.has(product.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white/90 border-gray-300 hover:border-blue-400'
                }`}
              >
                {selectedProducts.has(product.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Product Image */}
              <div className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                selectedProducts.has(product.id) ? 'border-blue-600' : 'border-gray-200'
              } ${!selectedProducts.has(product.id) ? 'opacity-50' : ''}`}>
                {product.thumbnail && (
                  <img
                    src={product.thumbnail}
                    alt={product.title || ""}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Product Title */}
              <p className={`text-xs text-gray-600 mt-2 line-clamp-2 ${
                !selectedProducts.has(product.id) ? 'opacity-50' : ''
              }`}>
                {product.title}
              </p>

              {/* "This" Badge for Main Product */}
              {index === 0 && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  This
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total Price and CTA */}
      <div className={`flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg ${isMobile ? 'flex-col items-stretch' : ''}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <p className="text-sm text-gray-600">
            Total for {selectedCount} {selectedCount === 1 ? 'item' : 'items'}
          </p>
          {totalPrice > 0 ? (
            <p className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              ₹{(totalPrice / 100).toLocaleString("en-IN")}
            </p>
          ) : (
            <p className={`font-semibold text-orange-600 ${isMobile ? 'text-base' : 'text-lg'}`}>
              Request Quote
            </p>
          )}
        </div>

        <button
          onClick={onAddBundle}
          className={`bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
            isMobile ? 'w-full py-3 text-sm' : 'px-6 py-3'
          }`}
        >
          <ShoppingCart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          Add {selectedCount > 1 ? 'Bundle' : 'Item'} to Cart
        </button>
      </div>
    </div>
  )
}
