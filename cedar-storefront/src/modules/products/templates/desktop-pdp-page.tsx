"use client"

import { HttpTypes } from "@medusajs/types"
import { useUser } from "@/lib/auth/client"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

// Import desktop sections
import ProductHeroSection from "../sections/01-product-hero-section"
import TitleBadgesSection from "../sections/02-title-badges-section"
import ShortDescriptionSection from "../sections/03-short-description-section"
import PricingBlockSection from "../sections/04-pricing-block-section"
import VariantsSelectorSection from "../sections/05-variants-selector-section"
import CTAButtonsSection from "../sections/06-cta-buttons-section"
import DetailedDescriptionSection from "../sections/07-detailed-description-section"
import KeySpecTableSection from "../sections/08-key-spec-table-section"
import ResourcesSection from "../sections/09-resources-section"
import TestimonialsSection from "../sections/10-testimonials-section"
import FAQSection from "../sections/11-faq-section"
import FrequentlyBoughtTogetherSection from "../sections/12-frequently-bought-together-section"
import RelatedRecentlyViewedSection from "../sections/13-related-recently-viewed-section"

interface CatalogContext {
  from?: string
  category?: string
  application?: string
  search?: string
}

interface ProductDetailPageProps {
  product: HttpTypes.StoreProduct
  relatedProducts?: HttpTypes.StoreProduct[]
  bundleProducts?: HttpTypes.StoreProduct[]
  catalogContext?: CatalogContext
}

export default function ProductDetailPage({
  product,
  relatedProducts = [],
  bundleProducts = [],
  catalogContext
}: ProductDetailPageProps) {
  const { user } = useUser()

  // User type and pricing logic
  const isGuest = !user
  const accountType = user?.unsafeMetadata?.accountType as string | undefined
  const isBusiness = accountType === "business"
  const isVerified = user?.unsafeMetadata?.is_verified === true
  const showPrice = isBusiness && isVerified

  const price = product.variants?.[0]?.calculated_price?.calculated_amount || null
  const originalPrice = product.variants?.[0]?.calculated_price?.original_amount || null

  // Images
  const images = product.images || []
  const allImages = [product.thumbnail, ...images.map(img => img.url)].filter(Boolean) as string[]

  // Extract metadata
  const badges = product.metadata?.badges as any[] || []
  const specifications = product.metadata?.specifications as any[] || [
    { label: "SKU", value: product.id },
    { label: "Category", value: product.categories?.[0]?.name || "N/A" }
  ]
  const resources = product.metadata?.resources as any[] || []
  const testimonials = product.metadata?.testimonials as any[] || []
  const faqs = product.metadata?.faqs as any[] || []
  const features = product.metadata?.features as string[] || []
  const variants = product.metadata?.variants as any[] || []

  // Back URL
  const getBackUrl = () => {
    if (catalogContext?.category) return `/catalog?category=${catalogContext.category}`
    if (catalogContext?.application) return `/catalog?application=${catalogContext.application}`
    if (catalogContext?.search) return `/catalog?search=${catalogContext.search}`
    return "/catalog"
  }

  // Handlers
  const handleAddToCart = (quantity: number) => {
    console.log("Add to cart:", product.id, "Quantity:", quantity)
    // TODO: Implement add to cart
  }

  const handleRequestQuote = () => {
    console.log("Request quote:", product.id)
    // TODO: Implement quote request
  }

  const handleWishlist = () => {
    console.log("Toggle wishlist:", product.id)
    // TODO: Implement wishlist
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description || "",
        url: window.location.href
      })
    }
  }

  const handleAddBundle = () => {
    console.log("Add bundle to cart")
    // TODO: Implement bundle add to cart
  }

  return (
    <>
      {/* Desktop Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <Link 
            href={getBackUrl()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {/* Section 1 & 2-6: Hero + Product Info (3-column layout) */}
        <div className="flex gap-4">
          {/* Left + Middle Column - Product Hero + Variants */}
          <div className="flex-1 space-y-6">
            <ProductHeroSection 
              images={allImages}
              productTitle={product.title || "Product"}
            />

            {/* Section 5: Variants Selector (moved under image) */}
            {variants.length > 0 && (
              <VariantsSelectorSection variants={variants} />
            )}
          </div>

          {/* Right Column - Sections 2-4, 6 */}
          <div className="flex-1 space-y-6">
            {/* Section 2: Title + Badges */}
            <TitleBadgesSection
              title={product.title || ""}
              badges={badges}
            />

            {/* Section 3: Short Description */}
            <ShortDescriptionSection
              description={product.description || ""}
            />

            {/* Section 4: Pricing Block */}
            <PricingBlockSection
              showPrice={showPrice}
              price={price}
              originalPrice={originalPrice}
              isGuest={isGuest}
              isBusiness={isBusiness}
              isVerified={isVerified}
            />

            {/* Section 6: CTA Buttons */}
            <CTAButtonsSection
              showAddToCart={showPrice}
              onAddToCart={handleAddToCart}
              onRequestQuote={handleRequestQuote}
              onWishlist={handleWishlist}
              onShare={handleShare}
            />
          </div>
        </div>

        {/* Section 7: Detailed Description */}
        <DetailedDescriptionSection
          description={product.description || ""}
          features={features}
        />

        {/* Section 8: Key Spec Table */}
        <KeySpecTableSection specifications={specifications} />

        {/* Section 9: Resources */}
        {resources.length > 0 && (
          <ResourcesSection resources={resources} />
        )}

        {/* Section 10: Testimonials */}
        {testimonials.length > 0 && (
          <TestimonialsSection testimonials={testimonials} />
        )}

        {/* Section 11: FAQ */}
        {faqs.length > 0 && (
          <FAQSection faqs={faqs} />
        )}

        {/* Section 12: Frequently Bought Together */}
        {bundleProducts.length > 0 && (
          <FrequentlyBoughtTogetherSection
            mainProduct={product}
            bundleProducts={bundleProducts}
            onAddBundle={handleAddBundle}
          />
        )}

        {/* Section 13: Related + Recently Viewed */}
        <RelatedRecentlyViewedSection
          relatedProducts={relatedProducts}
          catalogContext={catalogContext}
        />
        </div>
      </div>
    </>
  )
}
