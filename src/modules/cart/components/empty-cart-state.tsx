/**
 * Empty Cart State
 * Cedar Elevator Industries
 */

'use client'

import Link from 'next/link'
import { ShoppingCart, Package, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmptyCartState() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
          <ShoppingCart className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-600">
          Looks like you haven't added anything to your cart yet.
        </p>
      </div>

      <div className="mb-8">
        <Link href="/products">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
            <Package className="h-5 w-5 mr-2" />
            Browse Products
          </Button>
        </Link>
      </div>

      {/* Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
        <Link href="/catalog">
          <div className="border rounded-lg p-6 hover:border-orange-300 transition-colors cursor-pointer">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Browse Catalog</h3>
            <p className="text-sm text-gray-600">
              Explore our full range of elevator components
            </p>
          </div>
        </Link>
        <Link href="/request-quote">
          <div className="border rounded-lg p-6 hover:border-orange-300 transition-colors cursor-pointer">
            <Package className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Request Quote</h3>
            <p className="text-sm text-gray-600">
              Need a custom quote? We're here to help
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
