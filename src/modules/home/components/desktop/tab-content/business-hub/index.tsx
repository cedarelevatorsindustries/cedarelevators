"use client"

import { StatusStripV2 } from "@/modules/quote/components/status-strip-v2"
import { ActionNeededV2 } from "@/modules/quote/components/action-needed-v2"
import { ActionCardsGrid } from "@/modules/quote/components/action-cards-grid"
import { QuotesSidebar } from "@/modules/quote/components/quotes-sidebar"
import type { BusinessHubData } from "@/lib/actions/business-hub"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"

interface BusinessHubTabProps {
  data: BusinessHubData
  collections?: any[]
}

export default function BusinessHubTab({ data, collections = [] }: BusinessHubTabProps) {
  const { verification, actionItems, stats } = data

  // Transform database collections to match expected format
  const transformedCollections = collections.map((dbCollection) => ({
    id: dbCollection.id,
    title: dbCollection.title,
    description: dbCollection.description,
    slug: dbCollection.slug,
    displayLocation: [],
    layout: 'grid-4',
    icon: 'business',
    viewAllLink: `/catalog?collection=${dbCollection.slug}`,
    products: (dbCollection.products || []).map((pc: any) => {
      // Handle both formats: pc.product (nested) or pc (direct)
      const product = pc.product || pc
      return {
        id: product.id,
        title: product.name || product.title,
        name: product.name || product.title,
        slug: product.slug,
        handle: product.slug,
        thumbnail: product.thumbnail_url || product.thumbnail,
        price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
        compare_at_price: product.compare_at_price,
        // Include variants from product_variants for stock display
        variants: product.product_variants || []
      }
    }),
    isActive: dbCollection.is_active,
    sortOrder: dbCollection.sort_order,
    showViewAll: true
  }))

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

      {/* 4. Action Cards */}
      <ActionCardsGrid />

      {/* 5. Quotes & Orders Section */}
      <QuotesSidebar
        activeQuotes={stats.activeQuotes}
        activeOrders={stats.activeOrders}
      />

      {/* 3. Exclusive Business Collections - Moved to bottom */}
      {transformedCollections.map((collection) => (
        <DynamicCollectionSection key={collection.id} collection={collection} />
      ))}
    </div>
  )
}

