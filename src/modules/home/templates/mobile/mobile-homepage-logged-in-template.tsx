"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import {
  HeroLiteMobile
} from "../../components/mobile"
import dynamic from "next/dynamic"

const DynamicCollectionSection = dynamic(() => import("@/components/common/DynamicCollectionSection"), {
  loading: () => <div className="h-64 w-full animate-pulse bg-gray-50/50 rounded-lg" />,
  ssr: true
})

import type { Application } from "@/lib/data/applications"

const ApplicationsSection = dynamic(() => import("@/components/store/applications-section").then(mod => mod.ApplicationsSection), {
  loading: () => <div className="h-24 w-full animate-pulse bg-gray-100 rounded-lg mb-8" />,
  ssr: true
})

interface MobileHomepageLoggedInProps {
  products: Product[]
  categories: ProductCategory[]
  userType?: "individual" | "business" | "verified"
  collections: any[]
  applications?: Application[]
}

export default function MobileHomepageLoggedIn({
  products,
  categories,
  userType = "individual",
  collections: dbCollections = [],
  applications = []
}: MobileHomepageLoggedInProps) {
  // Use the same logic as desktop ProductsTab to transform collections
  const collections = dbCollections.map(dbCollection => {
    // Handle favorites collection (if passed in future)
    if (dbCollection.slug === "favorites" || dbCollection.slug === "your-favorites") {
      return {
        ...dbCollection,
        products: [], // We don't have user favorites passed here yet
        layout: 'grid-4',
        showViewAll: true,
        viewAllLink: '/favorites'
      }
    }

    // Handle recently viewed collection
    if (dbCollection.slug === "recently-viewed") {
      return {
        ...dbCollection,
        products: [], // We don't have recently viewed passed here yet
        layout: 'grid-4',
        showViewAll: true,
        viewAllLink: '/history'
      }
    }

    // Transform regular collections from database format
    return {
      id: dbCollection.id,
      title: dbCollection.title,
      description: dbCollection.description,
      slug: dbCollection.slug,
      displayLocation: [],
      layout: 'grid-4',
      icon: 'collection', // Default icon
      viewAllLink: `/catalog?collection=${dbCollection.slug}`,
      products: (dbCollection.products || []).map((pc: any) => {
        const product = pc.product || pc
        return {
          id: product.id,
          title: product.name,
          name: product.name,
          slug: product.slug,
          handle: product.slug,
          thumbnail: product.thumbnail_url || product.thumbnail,
          price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
          variants: [],
          metadata: {}
        }
      }),
      isActive: dbCollection.is_active,
      sortOrder: dbCollection.sort_order,
      showViewAll: true,
      metadata: {}
    }
  })

  return (
    <div className="w-full pt-14">
      {/* Hero Lite - Compact search */}
      <HeroLiteMobile />

      {/* Shop by Application - Only show if available (Matches Desktop) */}
      {applications.length > 0 && (
        <ApplicationsSection applications={applications} />
      )}

      {/* Dynamic Collections from Database (replacing hardcoded sections) */}
      <div className="space-y-2">
        {collections.length > 0 ? (
          collections.map((collection) => (
            <DynamicCollectionSection
              key={collection.id}
              collection={collection}
              variant="mobile"
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {/* Fallback if no collections loaded */}
          </div>
        )}
      </div>
    </div>
  )
}

