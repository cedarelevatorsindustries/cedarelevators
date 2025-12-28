"use client"

import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { getCollectionBySlug } from "@/lib/data/mockCollections"

/**
 * Featured Products Section for Desktop
 * Now uses the dynamic collection system with the "top-selling" collection
 */
const FeaturedProductsSection = () => {
  // Get the top-selling collection from mock data
  const featuredCollection = getCollectionBySlug("top-selling")
  
  // If collection doesn't exist or is inactive, don't render
  if (!featuredCollection) return null

  return (
    <section className="px-12">
      <DynamicCollectionSection collection={featuredCollection} />
    </section>
  )
}

export default FeaturedProductsSection
