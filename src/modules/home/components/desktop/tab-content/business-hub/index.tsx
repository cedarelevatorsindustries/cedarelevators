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
    viewAllLink: `/collections/${dbCollection.slug}`,
    products: (dbCollection.products || []).map((pc: any) => {
      const product = pc.product
      return {
        id: product.id,
        title: product.name,
        name: product.name,
        slug: product.slug,
        handle: product.slug,
        thumbnail: product.thumbnail,
        price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
        variants: [],
        metadata: { variant: 'business' }
      }
    }),
    isActive: dbCollection.is_active,
    sortOrder: dbCollection.sort_order,
    showViewAll: true,
    metadata: { variant: 'business' }
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

      {/* 3. Exclusive Business Collections */}
      {transformedCollections.map((collection) => (
        <DynamicCollectionSection key={collection.id} collection={collection} />
      ))}

      {/* 4. Action Cards */}
      <ActionCardsGrid />

      {/* 5. Quotes & Orders Section */}
      <QuotesSidebar
        activeQuotes={stats.activeQuotes}
        activeOrders={stats.activeOrders}
      />
    </div>
  )
}

