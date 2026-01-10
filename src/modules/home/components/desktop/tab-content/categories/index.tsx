"use client"

import { ProductCategory } from "@/lib/types/domain"
import type { ElevatorType } from "@/lib/data/elevator-types"
import ShopByCategories from "./sections/shop-by-categories"
import ShopByElevatorType from "./sections/shop-by-elevator-type"
import TopApplications from "./sections/top-applications"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import CategoryHelp from "./sections/category-help"

interface CategoriesTabProps {
  categories?: ProductCategory[]
  elevatorTypes?: ElevatorType[]
  collections: any[]
}

export default function CategoriesTab({
  categories = [],
  elevatorTypes = [],
  collections = []
}: CategoriesTabProps) {
  // Transform database collections to match expected format
  const transformedCollections = collections.map((dbCollection) => ({
    id: dbCollection.id,
    title: dbCollection.title,
    description: dbCollection.description,
    slug: dbCollection.slug,
    displayLocation: [],
    layout: 'grid-4',
    icon: 'trending',
    viewAllLink: `/catalog?collection=${dbCollection.slug}`,
    products: (dbCollection.products || []).map((pc: any) => {
      const product = pc.product
      return {
        id: product.id,
        title: product.name,
        name: product.name,
        slug: product.slug,
        handle: product.slug,
        thumbnail: product.thumbnail,
        price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
        variants: [],
        metadata: { variant: 'special' }
      }
    }),
    isActive: dbCollection.is_active,
    sortOrder: dbCollection.sort_order,
    showViewAll: true,
    metadata: { variant: 'special' }
  }))

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* 1. Shop by Categories - 2 line horizontal scroll */}
      <ShopByCategories categories={categories} />

      {/* 2. Special Collections for Categories - From database */}
      {transformedCollections.map((collection) => (
        <DynamicCollectionSection key={collection.id} collection={collection} />
      ))}

      {/* 3. Shop by Elevator Type - From database */}
      <ShopByElevatorType elevatorTypes={elevatorTypes} />

      <CategoryHelp />
    </div>
  )
}

