"use client"

import { Product } from "@/lib/types/domain"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { getCollectionsByLocation, mergeUserCollections } from "@/lib/data/mockCollections"
import HelpSection from "./sections/help-section"

interface ProductsTabProps {
  products?: Product[]
  userFavorites?: Product[]
  recentlyViewed?: Product[]
}

export default function ProductsTab({ 
  products = [],
  userFavorites = [],
  recentlyViewed = []
}: ProductsTabProps) {
  // Get all collections for the "House" location
  let collections = getCollectionsByLocation("House")
  
  // Merge user-specific data (favorites, recently viewed)
  collections = mergeUserCollections(collections, userFavorites, recentlyViewed)
  
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* Dynamically render all collections */}
      {collections.map((collection) => (
        <DynamicCollectionSection 
          key={collection.id} 
          collection={collection}
        />
      ))}
      
      {/* Help section remains static as it's not a product collection */}
      <HelpSection />
    </div>
  )
}
