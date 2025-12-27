"use client"

import { Product, ProductCategory, Order } from "@/lib/types/domain"
import ShopByCategories from "./sections/shop-by-categories"
import ShopByElevatorType from "./sections/shop-by-elevator-type"
import TopApplications from "./sections/top-applications"
import TrendingCollections from "./sections/trending-collections"
import CategoryHelp from "./sections/category-help"

interface CategoriesTabProps {
  categories?: ProductCategory[]
}

export default function CategoriesTab({ categories = [] }: CategoriesTabProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* 1. Shop by Categories - 2 line horizontal scroll */}
      <ShopByCategories categories={categories} />

      {/* 2. Trending Collections - 4 products in a row with full image */}
      <TrendingCollections />

      {/* 3. Shop by Elevator Type - 2 rows, 5 grid */}
      <ShopByElevatorType />

      {/* 4. Top Applications - same as Trending Collections style */}
      <TopApplications />

      <CategoryHelp />
    </div>
  )
}
