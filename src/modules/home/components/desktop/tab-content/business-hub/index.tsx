"use client"

import { StatusStripV2, ActionNeededV2, ActionCardsGrid, QuotesSidebar } from "@/modules/quote/components"
import type { BusinessHubData } from "@/lib/actions/business-hub"

interface BusinessHubTabProps {
  data: BusinessHubData
}

export default function BusinessHubTab({ data }: BusinessHubTabProps) {
  const { verification, actionItems, stats } = data

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-8">
      {/* 1. Status Strip - Verification Banner */}
      <StatusStripV2
        isVerified={verification.isVerified}
        isPending={verification.isPending}
        completionPercentage={verification.completionPercentage}
      />

      {/* 2. Action Needed Section */}
      <ActionNeededV2 actions={actionItems} />

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Action Cards (2/3 width) */}
        <div className="lg:col-span-2">
          <ActionCardsGrid />
        </div>

        {/* Right: Quotes & Orders Sidebar (1/3 width) */}
        <div className="lg:col-span-1">
          <QuotesSidebar
            activeQuotes={stats.activeQuotes}
            activeOrders={stats.activeOrders}
          />
        </div>
      </div>
    </div>
  )
}
