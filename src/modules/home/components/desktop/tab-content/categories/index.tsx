"use client"

import { ProductCategory } from "@/lib/types/domain"
import ShopByCategories from "./sections/shop-by-categories"
import ShopByElevatorType from "./sections/shop-by-elevator-type"
import TopApplications from "./sections/top-applications"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { getCollectionBySlug } from "@/lib/data/mockCollections"
import CategoryHelp from "./sections/category-help"

interface CategoriesTabProps {
  categories?: ProductCategory[]
}

export default function CategoriesTab({ categories = [] }: CategoriesTabProps) {
  // Get the trending collection
  const trendingCollection = getCollectionBySlug("trending")
  
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* 1. Shop by Categories - 2 line horizontal scroll */}
      <ShopByCategories categories={categories} />

      {/* 2. Trending Collections - Now dynamic */}
      {trendingCollection && (
        <DynamicCollectionSection collection={trendingCollection} />
      )}

      {/* 3. Shop by Elevator Type - 2 rows, 5 grid */}
      <ShopByElevatorType />

      {/* 4. Top Applications - same as Trending Collections style */}
      <TopApplications />

      <CategoryHelp />
    </div>
  )
}
