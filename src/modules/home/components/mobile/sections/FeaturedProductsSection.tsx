"use client"

import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { getCollectionBySlug } from "@/lib/data/mockCollections"

/**
 * Featured Products Section for Mobile
 * Now uses the dynamic collection system with the "top-selling" collection
 */
export default function FeaturedProductsSection() {
  // Get the top-selling collection from mock data
  const featuredCollection = getCollectionBySlug("top-selling")
  
  // If collection doesn't exist or is inactive, don't render
  if (!featuredCollection) return null

  return (
    <div className="bg-gray-50">
      <DynamicCollectionSection 
        collection={featuredCollection} 
        variant="mobile"
      />
    </div>
  )
}
