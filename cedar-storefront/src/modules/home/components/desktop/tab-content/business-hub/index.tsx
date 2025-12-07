"use client"

import VerificationStatusCard from "./components/verification-status-card"
import QuickPerformanceSnapshot from "./sections/quick-performance-snapshot"
import UnifiedTimeline from "./sections/unified-timeline"
import PrimaryActionBar from "./sections/primary-action-bar"
import ExclusiveProducts from "./sections/exclusive-products"
import SmartAlerts from "./sections/smart-alerts"
import { TawkChat } from "@/modules/quote/components"

export default function BusinessHubTab() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* 1. Verification & Account Status + Primary Action Bar (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VerificationStatusCard />
        </div>
        <div className="lg:col-span-1">
          <PrimaryActionBar />
        </div>
      </div>

      {/* 2. Smart Alerts */}
      <SmartAlerts />

      {/* 3. Quick Performance Snapshot */}
      <QuickPerformanceSnapshot />

      {/* 4. Smart Quote & Order Timeline (Unified Feed) */}
      <UnifiedTimeline />

      {/* 5. Your Exclusive Verified Catalog */}
      <ExclusiveProducts />

      {/* 6. Tawk.to Chat Widget */}
      <TawkChat 
        userName="Business User"
        userEmail="user@business.com"
      />
    </div>
  )
}
