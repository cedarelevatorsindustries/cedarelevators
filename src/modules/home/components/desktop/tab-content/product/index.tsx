"use client"

import { Product } from "@/lib/types/domain"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import HelpSection from "./sections/help-section"

interface ProductsTabProps {
  products?: Product[]
  userFavorites?: Product[]
  recentlyViewed?: Product[]
  collections: any[]
}

export default function ProductsTab({
  products = [],
  userFavorites = [],
  recentlyViewed = [],
  collections: dbCollections = []
}: ProductsTabProps) {
  // Transform database collections to display format
  const collections = dbCollections.map(dbCollection => {
    // Handle favorites collection
    if (dbCollection.slug === "favorites" || dbCollection.slug === "your-favorites") {
      return {
        ...dbCollection,
        products: userFavorites,
        layout: 'grid-4',
        showViewAll: true,
        viewAllLink: '/favorites'
      }
    }

    // Handle recently viewed collection
    if (dbCollection.slug === "recently-viewed") {
      return {
        ...dbCollection,
        products: recentlyViewed,
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
      icon: 'collection',
      viewAllLink: `/collections/${dbCollection.slug}`,
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
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* Dynamically render all collections from database */}
      {collections.length > 0 ? (
        collections.map((collection) => (
          <DynamicCollectionSection
            key={collection.id}
            collection={collection}
          />
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          No collections available at the moment.
        </div>
      )}

      {/* Help section remains static as it's not a product collection */}
      <HelpSection />
    </div>
  )
}
