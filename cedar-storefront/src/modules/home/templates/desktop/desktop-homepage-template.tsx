import { HttpTypes } from "@medusajs/types"
import {
  HeroSection,
  FeaturedProductsSection,
  QuickCategoriesSection,
  ShopByApplicationSection,
  WhyChooseCedarSection,
  TestimonialsSection,
  BulkOrderSection
} from "../../components/desktop/sections"

interface DesktopHomepageProps {
  products: HttpTypes.StoreProduct[]
  testimonials: any[]
}

export default function DesktopHomepage({ products, testimonials }: DesktopHomepageProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Categories */}
      <div className="mt-12">
        <QuickCategoriesSection />
      </div>

      {/* Featured Products */}
      {products.length > 0 && (
        <div className="mt-12">
          <FeaturedProductsSection products={products} />
        </div>
      )}

      {/* Shop by Application */}
      <div className="mt-12">
        <ShopByApplicationSection hasProducts={products.length > 0} />
      </div>

      {/* Why Choose Cedar */}
      <div className="mt-12">
        <WhyChooseCedarSection />
      </div>

      {/* Bulk Order CTA / Quote Section */}
      <div className="mt-12">
        <BulkOrderSection />
      </div>

      {/* Testimonials - Below quote form */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}
    </div>
  )
}
