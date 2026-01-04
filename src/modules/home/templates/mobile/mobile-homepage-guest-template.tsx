import { Product, ProductCategory, Order } from "@/lib/types/domain"
import type { Application } from "@/lib/data/applications"
import type { ElevatorType } from "@/lib/data/elevator-types"
import {
  HeroGuestMobile as HeroSection,
  CategoriesMobile
} from "../../components/mobile"
import {
  ElevatorTypesSection,
  WhyCedarSection,
  TestimonialsSection,
  FeaturedProductsSection
} from "@/components/shared/sections"
import { ApplicationsSection } from "@/components/store/applications-section"

interface MobileHomepageGuestProps {
  products: Product[]
  categories: ProductCategory[]
  applications: Application[]
  elevatorTypes: ElevatorType[]
  testimonials: any[]
}

export default function MobileHomepageGuest({
  products,
  categories,
  applications,
  elevatorTypes,
  testimonials
}: MobileHomepageGuestProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories - Horizontal scroll without scrollbar */}
      <CategoriesMobile categories={categories} />

      {/* Featured Products - 2 products with View More button */}
      {products.length > 0 && (
        <FeaturedProductsSection variant="mobile" />
      )}

      {/* Shop by Application */}
      <ApplicationsSection applications={applications} />

      {/* Shop by Elevator Type - 6 cards, 2 per row */}
      <ElevatorTypesSection variant="mobile" elevatorTypes={elevatorTypes} />

      {/* Why Cedar */}
      <WhyCedarSection variant="mobile" />

      {/* Customer Reviews - Short testimonial */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials.slice(0, 1)} variant="mobile" />
      )}
    </div>
  )
}

