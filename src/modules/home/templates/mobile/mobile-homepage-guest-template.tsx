import { Product, ProductCategory, Order } from "@/lib/types/domain"
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

interface MobileHomepageGuestProps {
  products: Product[]
  categories: ProductCategory[]
  testimonials: any[]
}

export default function MobileHomepageGuest({
  products,
  categories,
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

      {/* Shop by Elevator Type - 6 cards, 2 per row */}
      <ElevatorTypesSection variant="mobile" />

      {/* Why Cedar */}
      <WhyCedarSection variant="mobile" />

      {/* Customer Reviews - Short testimonial */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials.slice(0, 1)} variant="mobile" />
      )}
    </div>
  )
}
