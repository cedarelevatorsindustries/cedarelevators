"use client"

import { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { useUser } from "@/lib/auth/client"
import { ChevronLeft, Heart, Share2, ShoppingCart, MessageSquare } from "lucide-react"
import Link from "next/link"

// Import sections
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

interface MobileProductDetailPageProps {
  product: HttpTypes.StoreProduct
  relatedProducts?: HttpTypes.StoreProduct[]
  bundleProducts?: HttpTypes.StoreProduct[]
  catalogContext?: CatalogContext
}

export default function MobileProductDetailPage({
  product,
  relatedProducts = [],
  bundleProducts = [],
  catalogContext
}: MobileProductDetailPageProps) {
  const { user } = useUser()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const imageScrollRef = useRef<HTMLDivElement>(null)
  const ctaSectionRef = useRef<HTMLDivElement>(null)

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

  // Track image scroll
  useEffect(() => {
    const scrollContainer = imageScrollRef.current
    if (!scrollContainer) return

    const handleImageScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft
      const width = scrollContainer.offsetWidth
      const index = Math.round(scrollLeft / width)
      setCurrentImageIndex(index)
    }

    scrollContainer.addEventListener('scroll', handleImageScroll)
    return () => scrollContainer.removeEventListener('scroll', handleImageScroll)
  }, [])

  // Track scroll to show/hide floating bar after CTA section
  useEffect(() => {
    const handleScroll = () => {
      if (ctaSectionRef.current) {
        const rect = ctaSectionRef.current.getBoundingClientRect()
        // Show floating bar when CTA section is scrolled past
        setShowFloatingBar(rect.bottom < 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>

      <div className="bg-gray-50">
        {/* Mobile Hero Image Carousel - Full Screen */}
        <div className="relative">
          {/* Mobile Header Overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
            <Link href={getBackUrl()} className="p-2 -ml-2 bg-black/30 backdrop-blur-sm hover:bg-black/40 rounded-lg transition-colors">
              <ChevronLeft size={24} className="text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="p-2 bg-black/30 backdrop-blur-sm hover:bg-black/40 rounded-lg transition-colors"
              >
                <Share2 size={20} className="text-white" />
              </button>
              <button 
                onClick={handleWishlist}
                className="p-2 bg-black/30 backdrop-blur-sm hover:bg-black/40 rounded-lg transition-colors"
              >
                <Heart size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Dark Gradient Overlay for Header Visibility */}
          <div 
            className="absolute top-0 left-0 right-0 h-32 z-10"
            style={{
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)'
            }}
            aria-hidden="true"
          />

          {/* Image Carousel */}
          <div 
            ref={imageScrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {allImages.map((image, i) => (
              <div key={i} className="flex-shrink-0 w-full snap-center">
                <div className="aspect-square bg-white relative">
                  <img
                    src={image}
                    alt={`${product.title} - View ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  imageScrollRef.current?.scrollTo({ 
                    left: i * (imageScrollRef.current?.offsetWidth || 0), 
                    behavior: 'smooth' 
                  })
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentImageIndex ? "bg-white w-6" : "bg-white/50 w-1.5"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Product Info */}
          <div className="bg-white -mx-4 px-4 py-4 space-y-4">
            <TitleBadgesSection
              title={product.title || ""}
              badges={badges}
            />

            <ShortDescriptionSection
              description={product.description || ""}
            />

            <PricingBlockSection
              showPrice={showPrice}
              price={price}
              originalPrice={originalPrice}
              isGuest={isGuest}
              isBusiness={isBusiness}
              isVerified={isVerified}
            />

            {variants.length > 0 && (
              <VariantsSelectorSection variants={variants} />
            )}

            <div ref={ctaSectionRef}>
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
              isMobile={true}
            />
          )}

          {/* Section 13: Related + Recently Viewed */}
          <div className="pb-20">
            <RelatedRecentlyViewedSection
              relatedProducts={relatedProducts}
              catalogContext={catalogContext}
              isMobile={true}
            />
          </div>
        </div>

        {/* Floating Bottom Bar - Shows after scrolling past CTA section */}
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 z-50 ${
            showFloatingBar ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Price Info */}
              <div className="flex-1">
                {showPrice && price ? (
                  <>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{(price / 100).toLocaleString("en-IN")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">Pricing</p>
                    <p className="text-sm font-semibold text-orange-600">
                      {isGuest ? "Login to see price" : isBusiness && !isVerified ? "Verify to see price" : "Price on request"}
                    </p>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {showPrice && (
                  <button
                    onClick={() => handleAddToCart(1)}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                )}
                <button
                  onClick={handleRequestQuote}
                  className="px-4 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
