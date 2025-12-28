"use client"

import VerificationStatusCard from "./components/verification-status-card"
import PrimaryActionBar from "./sections/primary-action-bar"
import ActionAlerts from "./sections/smart-alerts"
import QuotesOrdersSnapshot from "./sections/quotes-orders-snapshot"

export default function BusinessHubTab() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-8">
      {/* 1. Verification & Primary Action Bar (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VerificationStatusCard />
        </div>
        <div className="lg:col-span-1">
          <PrimaryActionBar />
        </div>
      </div>

      {/* 2. Action Alerts */}
      <ActionAlerts />

      {/* 3. Quotes & Orders Snapshot */}
      <QuotesOrdersSnapshot />
    </div>
  )
}
