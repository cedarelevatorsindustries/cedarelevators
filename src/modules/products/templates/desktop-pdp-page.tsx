"use client"

import { Product } from "@/lib/types/domain"
import { useUser } from "@/lib/auth/client"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

// Import desktop sections
import ProductHeroSection from "../sections/01-product-hero-section"
import TitleBadgesSection from "../sections/02-title-badges-section"
import PricingBlockSection from "../sections/04-pricing-block-section"
import CTAButtonsSection from "../sections/06-cta-buttons-section"
import ProductTabsSection from "../sections/14-product-tabs-section"
import ReviewsSection from "../sections/15-reviews-section"
import FrequentlyBoughtTogetherSection from "../sections/12-frequently-bought-together-section"
import RelatedRecentlyViewedSection from "../sections/13-related-recently-viewed-section"
import VariantSelector from "../components/product/variant-selector"
import { useRef, useState } from "react"

interface CatalogContext {
  from?: string
  category?: string
  application?: string
  search?: string
}

interface ProductDetailPageProps {
  product: Product
  relatedProducts?: Product[]
  bundleProducts?: Product[]
  catalogContext?: CatalogContext
}

export default function ProductDetailPage({
  product,
  relatedProducts = [],
  bundleProducts = [],
  catalogContext
}: ProductDetailPageProps) {
  const { user } = useUser()
  const reviewsSectionRef = useRef<HTMLDivElement>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  // User type and pricing logic
  const isGuest = !user
  const accountType = user?.unsafeMetadata?.accountType as string | undefined
  const isBusiness = accountType === "business"
  const isVerified = user?.unsafeMetadata?.is_verified === true
  const showPrice = isBusiness && isVerified

  const price = product.price?.amount || 0
  const originalPrice = null // TODO: Add original price to schema if needed

  // Images
  const images = product.images || []
  const allImages = [product.thumbnail, ...images.map(img => img.url)].filter(Boolean) as string[]

  // Extract metadata
  const badges = product.metadata?.badges as any[] || []
  const specifications = product.metadata?.specifications as any[] || [
    { label: "SKU", value: product.id },
    { label: "Category", value: product.category_id || "N/A" }
  ]
  const reviews = product.metadata?.reviews as any[] || []
  const features = product.metadata?.features as string[] || []
  const variants = product.metadata?.variants as any[] || []

  // Back URL
  const getBackUrl = () => {
    if (catalogContext?.category) return `/catalog?category=${catalogContext.category}`
    if (catalogContext?.application) return `/catalog?application=${catalogContext.application}`
    if (catalogContext?.search) return `/catalog?search=${catalogContext.search}`
    return "/catalog"
  }

  // Check if all variants are selected
  const allVariantsSelected = variants.length === 0 ||
    variants.every((variantGroup: any) => selectedVariants[variantGroup.type])

  // Handlers
  const handleVariantChange = (variantType: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantType]: variantId }))
    console.log("Variant changed:", variantType, variantId)
  }

  const handleAddToCart = (quantity: number) => {
    console.log("Add to cart:", product.id, "Quantity:", quantity, "Variants:", selectedVariants)
    // TODO: Implement add to cart with selected variants
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

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

      {/* Main Content - 2 Column Layout with Sticky Left */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          {/* 2-Column Product Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-8 items-start">
            {/* Left Column - Sticky Image Section */}
            <div className="sticky top-24 self-start">
              <ProductHeroSection
                images={allImages}
                productTitle={product.title || "Product"}
              />
            </div>

            {/* Right Column - Scrollable Content */}
            <div className="space-y-6">
              {/* Product Info Section */}
              <div className="bg-white rounded-lg p-6 space-y-6">
                {/* Badges → Title → Description → SKU → Stars */}
                <TitleBadgesSection
                  title={product.title || ""}
                  badges={badges}
                  sku={product.id}
                  description={product.description || ""}
                />

                {/* Variant Selector */}
                {variants.length > 0 && (
                  <VariantSelector
                    variants={variants}
                    onVariantChange={handleVariantChange}
                  />
                )}

                {/* Pricing Block */}
                <PricingBlockSection
                  showPrice={showPrice}
                  price={price}
                  originalPrice={originalPrice}
                  isGuest={isGuest}
                  isBusiness={isBusiness}
                  isVerified={isVerified}
                />

                {/* CTA Buttons */}
                <CTAButtonsSection
                  isGuest={isGuest}
                  isBusiness={isBusiness}
                  isVerified={isVerified}
                  accountType={accountType}
                  allVariantsSelected={allVariantsSelected}
                  hasVariants={variants.length > 0}
                  onAddToCart={handleAddToCart}
                  onRequestQuote={handleRequestQuote}
                  onWishlist={handleWishlist}
                  onShare={handleShare}
                />
              </div>

              {/* Product Tabs: Description, Tech Specs, Reviews */}
              <ProductTabsSection
                description={product.description || ""}
                features={features}
                specifications={specifications}
                reviews={reviews}
                onScrollToReviews={scrollToReviews}
              />
            </div>
          </div>

          {/* Full Width Sections Below */}
          <div className="space-y-8">
            {/* Reviews Section - Full Width */}
            <ReviewsSection
              ref={reviewsSectionRef}
              reviews={reviews}
              productId={product.id}
            />

            {/* Frequently Bought Together */}
            {bundleProducts.length > 0 && (
              <FrequentlyBoughtTogetherSection
                mainProduct={product}
                bundleProducts={bundleProducts}
                onAddBundle={handleAddBundle}
              />
            )}

            {/* Related + Recently Viewed */}
            <RelatedRecentlyViewedSection
              relatedProducts={relatedProducts}
              catalogContext={catalogContext}
            />
          </div>
        </div>
      </div>
    </>
  )
}
