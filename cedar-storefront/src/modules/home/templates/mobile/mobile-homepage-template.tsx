import { HttpTypes } from "@medusajs/types"
import {
  HeroGuestMobile as HeroSection,
  HeroButtonsMobile as HeroButtonsSection,
  QuickAccessCategoriesSection,
  FeaturedProductsSection,
  CategoryBlocksSection,
  QuickQuoteSection,
  WhyCedarSection,
  CustomerReviewsSection,
  NeedHelpSection
} from "../../components/mobile"

interface MobileHomepageProps {
  products: HttpTypes.StoreProduct[]
  testimonials: any[]
}

export default function MobileHomepage({ products, testimonials }: MobileHomepageProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Hero Action Buttons */}
      <HeroButtonsSection />

      {/* Quick Access Categories */}
      <QuickAccessCategoriesSection />

      {/* Featured Products */}
      {products.length > 0 && (
        <FeaturedProductsSection products={products} />
      )}

      {/* Category Blocks */}
      <CategoryBlocksSection />

      {/* Quick Quote Section */}
      <QuickQuoteSection />

      {/* Why Cedar */}
      <WhyCedarSection />

      {/* Customer Reviews - No padding, touches Why Cedar */}
      {testimonials.length > 0 && (
        <CustomerReviewsSection testimonials={testimonials} />
      )}

      {/* Need Help Section - Removed (testimonials touch footer) */}
    </div>
  )
}
