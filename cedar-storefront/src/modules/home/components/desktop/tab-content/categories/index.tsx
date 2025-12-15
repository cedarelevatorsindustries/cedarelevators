"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import ShopByCategories from "./sections/shop-by-categories"
import ShopByApplication from "./sections/shop-by-application"
import TopApplications from "./sections/top-applications"
import TrendingCollections from "./sections/trending-collections"
import CategoryHelp from "./sections/category-help"

interface CategoriesTabProps {
  categories?: ProductCategory[]
}

export default function CategoriesTab({ categories = [] }: CategoriesTabProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* 1. Shop by Categories (renamed from Find the parts you need) - 2 line horizontal scroll */}
      <ShopByCategories categories={categories} />

      {/* 2. Trending Collections - 4 products in a row with full image */}
      <TrendingCollections />

      {/* 3. Shop by Application - same as guest homepage */}
      <ShopByApplication />

      {/* 4. Top Applications - same as Trending Collections style */}
      <TopApplications />

      <CategoryHelp />
    </div>
  )
}
