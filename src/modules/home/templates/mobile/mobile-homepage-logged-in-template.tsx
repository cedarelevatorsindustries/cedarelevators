"use client"

import { useState, useEffect } from "react"
import { Product, ProductCategory } from "@/lib/types/domain"
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
        // For now, just use empty array until we implement proper fetching
        setWishlistProducts([])
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
        // For now, just use empty array until we implement proper fetching
        setRecentProducts([])
      } catch {
        setRecentProducts([])
      }
    }
  }, [])

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
      showViewAll: true,
      metadata: {}
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
    <div className="w-full pt-14">
      {/* Hero Lite - Compact search */}
      <HeroLiteMobile />

      {/* Shop by Application - Only show if available (Matches Desktop) */}
      {applications.length > 0 && (
        <ApplicationsSection applications={applications} />
      )}

      {/* Dynamic Collections from Database + Wishlist + Recently Viewed */}
      <div className="space-y-2">
        {allCollections.length > 0 ? (
          allCollections.map((collection) => (
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

