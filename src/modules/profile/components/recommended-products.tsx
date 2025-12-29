'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ui/product-card'
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { listProducts } from '@/lib/data/products'

interface RecommendedProductsProps {
  className?: string
}

export default function RecommendedProducts({ className }: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { response } = await listProducts({
          queryParams: { limit: 8 }
        })
        setProducts(response.products)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Recommended Products
          </h2>
          <p className="text-gray-600">
            Based on your browsing history and preferences
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recommended Products
        </h2>
        <p className="text-gray-600">
          Based on your browsing history and preferences
        </p>
      </div>

      {/* Products Grid - Using Global ProductCard */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* View More Button */}
          <div className="flex justify-center">
            <Link
              href="/catalog"
              className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-900 hover:text-white transition-colors"
            >
              View more
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No products available at the moment.</p>
          <Link
            href="/catalog"
            className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      )}
    </div>
  )
}
