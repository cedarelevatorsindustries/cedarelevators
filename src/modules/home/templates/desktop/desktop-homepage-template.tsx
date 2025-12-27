import { Product, ProductCategory } from "@/lib/types/domain"
import {
  HeroSection,
  FeaturedProductsSection,
  QuickCategoriesSection,
  WhyChooseCedarSection,
  TestimonialsSection,
  BulkOrderSection
} from "../../components/desktop/sections"
import { ApplicationsSection } from "@/components/store/applications-section"
import ShopByTypeSection from "@/components/store/shop-by-type-section"

interface DesktopHomepageProps {
  products: Product[]
  categories: ProductCategory[]
  testimonials: any[]
}

export default function DesktopHomepage({ products, categories, testimonials }: DesktopHomepageProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Shop by Application - Work stages (Erection, Testing, Service, Others) */}
      <ApplicationsSection />

      {/* Quick Categories */}
      <div className="mt-12">
        <QuickCategoriesSection categories={categories} />
      </div>

      {/* Featured Products */}
      {products.length > 0 && (
        <div className="mt-12">
          <FeaturedProductsSection products={products} />
        </div>
      )}

      {/* Shop by Type - Elevator Type categorization */}
      <div className="mt-12">
        <ShopByTypeSection hasProducts={products.length > 0} />
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
