"use client"

import { useState, useEffect } from "react"
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
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [isClient, setIsClient] = useState(false)

  // Load wishlist and recently viewed from client-side
  useEffect(() => {
    setIsClient(true)

    // Load wishlist from localStorage
    const wishlistStr = localStorage.getItem('wishlist')
    if (wishlistStr) {
      try {
        const wishlistIds = JSON.parse(wishlistStr) as string[]
        // TODO: Fetch actual product data for wishlist IDs
        // For now, use userFavorites prop if available
        setWishlistProducts(userFavorites)
      } catch {
        setWishlistProducts([])
      }
    }

    // Load recently viewed from localStorage
    const recentStr = localStorage.getItem('recentlyViewed')
    if (recentStr) {
      try {
        const recentIds = JSON.parse(recentStr) as string[]
        // TODO: Fetch actual product data for recent IDs
        // For now, use recentlyViewed prop if available
        setRecentProducts(recentlyViewed)
      } catch {
        setRecentProducts([])
      }
    }
  }, [userFavorites, recentlyViewed])

  // Transform database collections to display format
  const collections = dbCollections.map(dbCollection => {
    // Transform regular collections from database format
    return {
      id: dbCollection.id,
      title: dbCollection.title,
      description: dbCollection.description,
      slug: dbCollection.slug,
      displayLocation: [],
      layout: 'grid-4',
      icon: 'none',
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
          // Include variants from product_variants for stock display
          variants: product.product_variants || [],
          metadata: {}
        }
      }),
      isActive: dbCollection.is_active,
      sortOrder: dbCollection.sort_order,
      showViewAll: true,
      metadata: {},
      emptyStateMessage: ''
    }
  })

  // Create wishlist collection (only if has data)
  const wishlistCollection = isClient && wishlistProducts.length > 0 ? {
    id: 'your-favorites',
    title: 'Your Favourites',
    description: 'Products you\'ve saved for later',
    slug: 'your-favorites',
    displayLocation: [],
    layout: 'grid-4' as const,
    icon: 'heart' as const,
    viewAllLink: '/wishlist',
    products: wishlistProducts.slice(0, 4),
    isActive: true,
    sortOrder: -1, // Show first
    showViewAll: true,
    metadata: {},
    emptyStateMessage: ''
  } : null

  // Create recently viewed collection (only if has data)
  const recentlyViewedCollection = isClient && recentProducts.length > 0 ? {
    id: 'recently-viewed',
    title: 'Recently Viewed',
    description: 'Pick up where you left off',
    slug: 'recently-viewed',
    displayLocation: [],
    layout: 'grid-4' as const,
    icon: 'none' as const,
    viewAllLink: '', // No view all for recently viewed
    products: recentProducts.slice(0, 4),
    isActive: true,
    sortOrder: 999, // Show last
    showViewAll: false,
    metadata: {},
    emptyStateMessage: ''
  } : null

  // Combine all collections and sort
  const allCollections = [
    ...(wishlistCollection ? [wishlistCollection] : []),
    ...collections,
    ...(recentlyViewedCollection ? [recentlyViewedCollection] : [])
  ].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* Dynamically render all collections */}
      {allCollections.length > 0 ? (
        allCollections.map((collection) => (
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
