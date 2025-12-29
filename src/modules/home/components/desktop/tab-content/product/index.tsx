import { Product } from "@/lib/types/domain"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { getCollectionsForDisplay } from "@/lib/actions/collections"
import HelpSection from "./sections/help-section"

interface ProductsTabProps {
  products?: Product[]
  userFavorites?: Product[]
  recentlyViewed?: Product[]
}

export default async function ProductsTab({
  products = [],
  userFavorites = [],
  recentlyViewed = []
}: ProductsTabProps) {
  // Get all collections for the "House" location from database
  const { collections: dbCollections } = await getCollectionsForDisplay("House")

  // Merge user-specific data (favorites, recently viewed) into collections
  const collections = dbCollections.map(collection => {
    // Handle favorites collection
    if (collection.slug === "favorites" || collection.slug === "your-favorites") {
      return { ...collection, products: userFavorites }
    }
    // Handle recently viewed collection
    if (collection.slug === "recently-viewed") {
      return { ...collection, products: recentlyViewed }
    }
    return collection
  })

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* Dynamically render all collections from database */}
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
