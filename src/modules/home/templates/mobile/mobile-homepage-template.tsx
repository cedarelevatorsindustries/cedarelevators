import { Product, ProductCategory, Order } from "@/lib/types/domain"
import type { ElevatorType } from "@/lib/data/elevator-types"
import {
  HeroGuestMobile as HeroSection,
  HeroButtonsMobile as HeroButtonsSection,
  QuickAccessCategoriesSection,
  CategoryBlocksSection,
  NeedHelpSection
} from "../../components/mobile"
import {
  WhyCedarSection,
  TestimonialsSection,
  FeaturedProductsSection
} from "@/components/shared/sections"

interface MobileHomepageProps {
  products: Product[]
  categories: ProductCategory[]
  testimonials: any[]
  elevatorTypes?: ElevatorType[]
}

export default function MobileHomepage({ products, categories, testimonials, elevatorTypes = [] }: MobileHomepageProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Hero Action Buttons */}
      <HeroButtonsSection />

      {/* Quick Access Categories */}
      <QuickAccessCategoriesSection categories={categories} />

      {/* Featured Products */}
      {products.length > 0 && (
        <FeaturedProductsSection variant="mobile" products={products} />
      )}

      {/* Category Blocks */}
      <CategoryBlocksSection categories={categories} />

      {/* Why Cedar */}
      <WhyCedarSection variant="desktop" />

      {/* Customer Reviews - No padding, touches Why Cedar */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} variant="mobile" />
      )}

      {/* Need Help Section - Removed (testimonials touch footer) */}
    </div>
  )
}

