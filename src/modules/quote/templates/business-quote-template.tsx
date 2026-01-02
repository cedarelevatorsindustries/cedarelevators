"use client"

import { Product } from "@/lib/types/domain"
import { BusinessHubHeaderV2 } from "../components/business-hub-header-v2"
import { StatusStripV2 } from "../components/status-strip-v2"
import { ActionCardsGrid } from "../components/action-cards-grid"
import { ActionNeededV2 } from "../components/action-needed-v2"
import { QuotesSidebar } from "../components/quotes-sidebar"
import { BusinessCollections } from "@/modules/collections/business-collections"

interface BusinessQuoteTemplateProps {
  products: Product[]
  companyName?: string
  isVerified?: boolean
  isPending?: boolean
  activeQuotes?: number
  activeOrders?: number
}

export default function BusinessQuoteTemplate({
  products,
  companyName,
  isVerified = false,
  isPending = false,
  activeQuotes = 0,
  activeOrders = 0
}: BusinessQuoteTemplateProps) {
  // Example action items (would come from API)
  const actionItems: any[] = [
    // {
    //   type: "approval" as const,
    //   title: "Order #4421 Requires Approval",
    //   subtitle: "Total: $12,450.00 • Pending manager review",
    //   href: "/orders/4421",
    //   ctaText: "Review"
    // },
    // {
    //   type: "expiring" as const,
    //   title: "Quote #Q-99 Expiring Soon",
    //   subtitle: "Expires in 2 days • Custom steel fabrication",
    //   href: "/quotes/Q-99",
    //   ctaText: "View Quote"
    // }
  ]

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50">
      {/* Header */}
      <BusinessHubHeaderV2 companyName={companyName} />

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-10 py-8 mx-auto w-full max-w-7xl">
        {/* Verification Strip */}
        <StatusStripV2
          isVerified={isVerified}
          isPending={isPending}
          completionPercentage={80}
        />

        {/* Action Cards Grid */}
        <ActionCardsGrid />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Action Needed & Collections */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Action Needed Section */}
            <ActionNeededV2 actions={actionItems} />

            {/* Business Collections */}
            <div>
              <BusinessCollections />
            </div>
          </div>

          {/* Sidebar: Quotes & Orders Summary */}
          <div className="lg:col-span-1">
            <QuotesSidebar
              activeQuotes={activeQuotes}
              activeOrders={activeOrders}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
