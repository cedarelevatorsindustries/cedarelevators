"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import { Plus, Wallet, TrendingUp, Package, RefreshCw, Grid } from "lucide-react"
import Link from "next/link"
import {
  StickyTopBar,
  PerformanceSnapshot,
  QuickActionsBar,
  QuoteTimeline,
  QuickReorder,
  QuoteItem
} from "../components"

interface IndividualQuoteTemplateProps {
  products: Product[]
}

export default function IndividualQuoteTemplate({ products }: IndividualQuoteTemplateProps) {
  // Individual specific stats
  const individualStats = [
    {
      label: "Total Spent",
      value: "₹45k",
      subtext: "Last 30 days",
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      label: "Total Saved",
      value: "₹5.2k",
      subtext: "With quotes",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100"
    }
  ]

  // Individual specific actions
  const individualActions = [
    { label: "New Quote", icon: Plus, href: "/request-quote/create", color: "bg-blue-600" },
    { label: "Quick Reorder", icon: RefreshCw, href: "/profile/orders", color: "bg-green-600" },
    { label: "Browse Catalog", icon: Grid, href: "/catalog", color: "bg-purple-600" }
  ]

  // Individual specific quotes
  const individualQuotes: QuoteItem[] = [
    {
      id: "Q-2024-001",
      title: "House Lift Kit",
      amount: "₹4.5 L",
      status: "pending",
      expiry: "Expires 24h"
    },
    {
      id: "Q-2024-002",
      title: "Spare Parts",
      amount: "₹12,000",
      status: "accepted"
    },
    {
      id: "Q-2023-089",
      title: "Maintenance Kit",
      amount: "₹8,500",
      status: "completed"
    }
  ]

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-24">
      {/* 1. Sticky Top Bar */}
      <StickyTopBar title="My Quotes" pendingCount={1} />

      {/* 2. Upgrade to Business Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">
              Upgrade to Business Account
            </h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              Get bulk pricing, credit terms, and dedicated support for your business.
            </p>
            <Link
              href="/profile/account"
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Performance Snapshot */}
      <PerformanceSnapshot stats={individualStats} />

      {/* 4. Quick Actions Bar */}
      <QuickActionsBar actions={individualActions} />

      {/* 5. Quote Timeline */}
      <QuoteTimeline quotes={individualQuotes} />

      {/* 6. Quick Reorder */}
      <QuickReorder />

      {/* 7. Help Section */}
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
            <span className="text-sm font-medium text-gray-700">Contact Sales</span>
            <span className="text-gray-400">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
