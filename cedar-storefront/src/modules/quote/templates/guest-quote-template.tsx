"use client"

import { HttpTypes } from "@medusajs/types"
import Link from "next/link"
import { CheckCircle, TrendingUp, Shield, Headset } from "lucide-react"
import {
  StickyTopBar,
  GuestQuoteForm,
  BottomCTA
} from "../components"
import { BestSellingCarousel } from "../components/best-selling-carousel"

interface GuestQuoteTemplateProps {
  products: HttpTypes.StoreProduct[]
}

export default function GuestQuoteTemplate({ products }: GuestQuoteTemplateProps) {
  return (
    <div className="w-full min-h-screen bg-gray-50 pb-24 relative">
      {/* 1. Sticky Top Bar */}
      <StickyTopBar title="Get Quote" showBack={true} showNotifications={false} />

      {/* 2. Why Choose Us Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">Why Get a Quote?</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">Best prices guaranteed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">Bulk discounts available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">Quality assured products</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Headset className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">24/7 customer support</span>
          </div>
        </div>
      </div>

      {/* 3. Quote Form */}
      <GuestQuoteForm />

      {/* 4. Best Selling Carousel */}
      <BestSellingCarousel products={products} />

      {/* 5. Help Section */}
      <div className="mx-4 mt-6 bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
        <div className="space-y-2">
          <Link
            href="/help"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Help & FAQ</span>
            <span className="text-gray-400">→</span>
          </Link>
          <Link
            href="tel:+911234567890"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Call Sales Team</span>
            <span className="text-gray-400">→</span>
          </Link>
          <Link
            href="https://wa.me/911234567890"
            className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-sm font-medium text-green-700">WhatsApp Support</span>
            <span className="text-green-400">→</span>
          </Link>
        </div>
      </div>

      {/* 6. Bottom CTA */}
      <BottomCTA />
    </div>
  )
}
