"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { Plus, Upload, BarChart3, Users } from "lucide-react"
import Link from "next/link"
import {
  StickyTopBar,
  VerificationBanner,
  PerformanceSnapshot,
  QuickActionsBar,
  SmartAlerts,
  QuoteTimeline,
  QuickReorder,
  ExclusiveSection,
  MiniAnalytics
} from "../components"

interface BusinessQuoteTemplateProps {
  products: Product[]
}

export default function BusinessQuoteTemplate({ products }: BusinessQuoteTemplateProps) {
  // Enhanced business actions
  const businessActions = [
    { label: "New Quote", icon: Plus, href: "/request-quote/create", color: "bg-blue-600" },
    { label: "Bulk Upload", icon: Upload, href: "/request-quote/bulk", color: "bg-purple-600" },
    { label: "Analytics", icon: BarChart3, href: "/profile/quotes", color: "bg-green-600" }
  ]

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-24 relative">
      {/* 1. Sticky Top Bar */}
      <StickyTopBar title="Business Hub" pendingCount={3} />

      {/* 2. Verification Banner */}
      <VerificationBanner isVerified={false} isPending={false} />

      {/* 3. Quick Performance Snapshot */}
      <PerformanceSnapshot />

      {/* 4. Quick Actions Bar */}
      <QuickActionsBar actions={businessActions} />

      {/* 5. Smart Alerts */}
      <SmartAlerts />

      {/* 6. Active / Pending Quotes & Orders Timeline */}
      <QuoteTimeline />

      {/* 7. Quick Reorder Carousel */}
      <QuickReorder />

      {/* 8. Exclusive to Business Section */}
      <ExclusiveSection />

      {/* 9. Mini Analytics */}
      <MiniAnalytics />

      {/* 10. Business Resources */}
      <div className="mx-4 mt-6 bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3">Business Resources</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/resources"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Upload className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs font-medium text-gray-700 text-center">Download Center</span>
          </Link>
          <Link
            href="/profile/quotes"
            className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-xs font-medium text-gray-700 text-center">Full Analytics</span>
          </Link>
          <Link
            href="/help"
            className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <span className="text-xl mb-2">❓</span>
            <span className="text-xs font-medium text-gray-700 text-center">Help Center</span>
          </Link>
          <Link
            href="tel:+911234567890"
            className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-xl mb-2">📞</span>
            <span className="text-xs font-medium text-gray-700 text-center">Priority Support</span>
          </Link>
        </div>
      </div>

      {/* Floating Action Button (FAB) - Always visible */}
      <div className="fixed bottom-24 right-4 z-40">
        <Link
          href="/request-quote/bulk"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-full shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
          <span className="font-bold text-lg">Bulk Quote</span>
        </Link>
      </div>
    </div>
  )
}
