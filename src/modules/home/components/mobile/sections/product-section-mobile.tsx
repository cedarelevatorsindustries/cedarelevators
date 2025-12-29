"use client"

import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { DisplayCollection } from "@/lib/types/display-collection"
import { Product } from "@/lib/types/domain"

interface ProductSectionMobileProps {
  title: string
  products: Product[]
  viewAllLink?: string
  icon?: "heart" | "trending" | "star" | "new" | "recommended" | "none"
}

/**
 * Product Section Mobile - Wrapper component
 * Converts props to a Collection object and renders DynamicCollectionSection
 * Kept for backward compatibility with existing code
 */
export default function ProductSectionMobile({
  title,
  products,
  viewAllLink = "/products",
  icon = "none"
}: ProductSectionMobileProps) {
  if (products.length === 0) return null

  // Create a temporary collection object from props
  const collection: DisplayCollection = {
    id: `temp_${title.toLowerCase().replace(/\s+/g, '-')}`,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    displayLocation: ["House"],
    layout: "horizontal-scroll",
    icon,
    viewAllLink,
    products,
    isActive: true,
    sortOrder: 0,
    showViewAll: true
  }

  return <DynamicCollectionSection collection={collection} variant="mobile" />
}
