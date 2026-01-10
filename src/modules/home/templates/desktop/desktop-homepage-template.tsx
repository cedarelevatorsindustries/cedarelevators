import { Product, ProductCategory } from "@/lib/types/domain"
import type { Application } from "@/lib/data/applications"
import type { ElevatorType } from "@/lib/data/elevator-types"
import type { Collection } from "@/lib/types/collections"
import {
  HeroSection,
  QuickCategoriesSection
} from "../../components/desktop/sections"
import {
  WhyCedarSection,
  TestimonialsSection,
  FeaturedProductsSection
} from "@/components/shared/sections"
import { ApplicationsSection } from "@/components/store/applications-section"
import ShopByTypeSection from "@/components/store/shop-by-type-section"
import CollectionSection from "@/components/store/collection-section"

interface DesktopHomepageProps {
  products: Product[]
  categories: ProductCategory[]
  testimonials: any[]
  applications?: Application[]
  elevatorTypes?: ElevatorType[]
  collections?: Array<Collection & { products: Product[] }>
}

export default function DesktopHomepage({
  products,
  categories,
  testimonials,
  applications = [],
  elevatorTypes = [],
  collections = []
}: DesktopHomepageProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Shop by Application - Work stages (Erection, Testing, Service, Others) */}
      {applications.length > 0 && (
        <ApplicationsSection applications={applications} />
      )}

      {/* Quick Categories */}
      <div className="mt-12">
        <QuickCategoriesSection categories={categories} />
      </div>

      {/* Featured Products */}
      {products.length > 0 && (
        <div className="mt-12">
          <FeaturedProductsSection />
        </div>
      )}

      {/* Collections - Show guest-safe collections */}
      {collections.length > 0 && (
        <div className="mt-12 space-y-8">
          {collections.map((collection) => (
            <CollectionSection
              key={collection.id}
              title={collection.title}
              slug={collection.slug}
              products={collection.products}
              variant="default"
            />
          ))}
        </div>
      )}

      {/* Shop by Type - Elevator Type categorization */}
      <div className="mt-12">
        <ShopByTypeSection hasProducts={products.length > 0} elevatorTypes={elevatorTypes} />
      </div>

      {/* Why Choose Cedar */}
      <div className="mt-12">
        <WhyCedarSection />
      </div>

      {/* Testimonials - Below quote form */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}
    </div>
  )
}
