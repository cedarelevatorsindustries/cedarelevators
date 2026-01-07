"use client"

import { Product, ProductCategory } from "@/lib/types/domain"
import type { Application } from "@/lib/data/applications"
import type { ElevatorType } from "@/lib/data/elevator-types"
import type { Collection } from "@/lib/types/collections"
import {
  HeroGuestMobile as HeroSection,
  CategoriesMobile
} from "../../components/mobile"
import {
  ElevatorTypesSection,
  WhyCedarSection,
  TestimonialsSection
} from "@/components/shared/sections"
import { ApplicationsSection } from "@/components/store/applications-section"
import CollectionSection from "@/components/store/collection-section"

interface MobileHomepageGuestProps {
  products: Product[]
  categories: ProductCategory[]
  applications: Application[]
  elevatorTypes: ElevatorType[]
  testimonials: any[]
  collections?: Array<Collection & { products: Product[] }>
}

export default function MobileHomepageGuest({
  products,
  categories,
  applications,
  elevatorTypes,
  testimonials,
  collections = []
}: MobileHomepageGuestProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Shop by Application - Immediately after hero */}
      <ApplicationsSection applications={applications} />

      {/* Categories - Horizontal scroll without scrollbar */}
      <CategoriesMobile categories={categories} />

      {/* Shop by Elevator Type - 6 cards, 2 per row */}
      <ElevatorTypesSection variant="mobile" elevatorTypes={elevatorTypes} />

      {/* General Collections - After Elevator Types */}
      {collections.map((collection) => (
        <CollectionSection
          key={collection.id}
          title={collection.title}
          slug={collection.slug}
          products={collection.products}
          variant="mobile"
        />
      ))}

      {/* Why Cedar */}
      <WhyCedarSection variant="desktop" />

      {/* Customer Reviews - Short testimonial */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials.slice(0, 1)} variant="mobile" />
      )}
    </div>
  )
}

