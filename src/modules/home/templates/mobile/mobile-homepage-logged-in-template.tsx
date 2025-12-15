"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import {
  HeroLiteMobile,
  ApplicationsMobile,
  ProductSectionMobile,
  QuickAccessCategoriesSection
} from "../../components/mobile"

interface MobileHomepageLoggedInProps {
  products: Product[]
  categories: ProductCategory[]
  favoriteProducts?: Product[]
  recentlyViewedProducts?: Product[]
  recommendedProducts?: Product[]
  userType?: "individual" | "business"
}

export default function MobileHomepageLoggedIn({
  products,
  categories,
  favoriteProducts = [],
  recentlyViewedProducts = [],
  recommendedProducts = [],
  userType = "individual"
}: MobileHomepageLoggedInProps) {
  // Organize products into different sections
  const newArrivals = products.slice(0, 5)
  const topChoices = products.slice(5, 10)
  const topSelling = products.slice(10, 15)
  const trending = products.slice(15, 20)

  return (
    <div className="w-full pt-14">
      {/* Hero Lite - Compact search */}
      <HeroLiteMobile />

      {/* Quick Access Categories */}
      <QuickAccessCategoriesSection categories={categories} />

      {/* Shop by Application - FIRST - Always show */}
      <ApplicationsMobile />

      {/* Your Favorites (from wishlist) - Show with demo data if empty */}
      <ProductSectionMobile
        title="Your Favorites"
        products={favoriteProducts.length > 0 ? favoriteProducts : products.slice(0, 5)}
        viewAllLink="/account/wishlist"
      />

      {/* Recently Viewed Products - Show with demo data if empty */}
      <ProductSectionMobile
        title="Recently Viewed"
        products={recentlyViewedProducts.length > 0 ? recentlyViewedProducts : products.slice(5, 10)}
        viewAllLink="/products"
      />

      {/* Top Selling Components */}
      {topSelling.length > 0 && (
        <ProductSectionMobile
          title="Top Selling Components"
          products={topSelling}
          viewAllLink="/products?sort=best-selling"
        />
      )}

      {/* Recommended for You */}
      {recommendedProducts.length > 0 && (
        <ProductSectionMobile
          title="Recommended for You"
          products={recommendedProducts}
          viewAllLink="/products?filter=recommended"
        />
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductSectionMobile
          title="New Arrivals"
          products={newArrivals}
          viewAllLink="/products?sort=newest"
        />
      )}

      {/* Top Choices This Month */}
      {topChoices.length > 0 && (
        <ProductSectionMobile
          title="Top Choices This Month"
          products={topChoices}
          viewAllLink="/products?filter=top-choices"
        />
      )}

      {/* Trending Products */}
      {trending.length > 0 && (
        <ProductSectionMobile
          title="Trending Products"
          products={trending}
          viewAllLink="/products?filter=trending"
        />
      )}
    </div>
  )
}
