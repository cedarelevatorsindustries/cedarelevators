import { Product, ProductCategory, Order } from "@/lib/types/domain"
import {
  HeroGuestMobile as HeroSection,
  FeaturedProductsSection,
  WhyCedarSection,
  CustomerReviewsSection,
  CategoriesMobile,
  ElevatorTypesMobile
} from "../../components/mobile"

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
        <FeaturedProductsSection products={products} />
      )}

      {/* Shop by Elevator Type - 6 cards, 2 per row */}
      <ElevatorTypesMobile />

      {/* Why Cedar */}
      <WhyCedarSection />

      {/* Customer Reviews - Short testimonial */}
      {testimonials.length > 0 && (
        <CustomerReviewsSection testimonials={testimonials.slice(0, 1)} />
      )}
    </div>
  )
}
