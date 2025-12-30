"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import {
  HeroLiteMobile,
  ElevatorTypesMobile,
  ProductSectionMobile,
  QuickAccessCategoriesSection
} from "../../components/mobile"
import FavoritesList from "@/modules/profile/components/favorites-list"
import RecentlyViewedList from "@/modules/profile/components/recently-viewed-list"

interface MobileHomepageLoggedInProps {
  products: Product[]
  categories: ProductCategory[]
  products: Product[]
  categories: ProductCategory[]
  userType?: "individual" | "business"
}

export default function MobileHomepageLoggedIn({
  products,
  categories,
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

      {/* Shop by Elevator Type - FIRST - Always show */}
      <ElevatorTypesMobile />

      {/* Your Favorites */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">Your Favorites</h2>
        </div>
        <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 w-max">
            {/* We need a horizontal scrolling favorites list? 
                   FavoritesList is a Grid. 
                   We should maybe adapt FavoritesList or just use it as grid but with mobile styling?
                   Mobile typically uses Horizontal Scroll. 
                   FavoritesList currently renders a Grid.
                   I should create a "MobileFavoritesList" or just update FavoritesList to handle mobile horizontal scroll?
                   Or just wrap it?
                   
                   Actually, RecentlyViewedList IS horizontal. FavoritesList IS grid.
                   For Mobile Homepage, "Your Favorites" section usually is horizontal?
                   The previous implementation used `ProductSectionMobile` which is likely horizontal.
                   
                   Let's use RecentlyViewedList style for Favorites on mobile?
                   Or just render FavoritesList (Grid) and let it wrap?
                   If user has 20 favorites, grid is better for "View All" page, but for HomePage section, horizontal is better.
                   
                   But I only have one `FavoritesList`.
                   For now, let's use `FavoritesList` which renders a GRID.
                   Wait, `ProductSectionMobile` likely renders horizontal.
                   
                   If I use `FavoritesList` (Grid), it will take a lot of vertical space.
                   I should probably update `FavoritesList` to support a `variant="horizontal"` or create `FavoritesListHorizontal`.
                   
                   Or I can continue using `ProductSectionMobile` BUT I need to fetch the data first?
                   But `FavoritesList` fetches data locally.
                   
                   I will just insert `FavoritesList` for now. If it looks bad (grid), I can refactor later.
                   Prioritizing function.
                */}
            <FavoritesList />
          </div>
        </div>

        {/* Recently Viewed Products */}
        <RecentlyViewedList />

        {/* Top Selling Components */}
        {topSelling.length > 0 && (
          <ProductSectionMobile
            title="Top Selling Components"
            products={topSelling}
            viewAllLink="/products?sort=best-selling"
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
