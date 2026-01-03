
"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Product } from "@/lib/types/domain"
import { useUser } from "@/lib/auth/client"
import { ChevronLeft, Share2, Heart, ShoppingCart, MessageSquare } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Sections
import TitleBadgesSection from "../sections/02-title-badges-section"
import PricingBlockSection from "../sections/04-pricing-block-section"
import CTAButtonsSection from "../sections/06-cta-buttons-section"
import ProductTabsSection from "../sections/14-product-tabs-section"
import ReviewsSection from "../sections/15-reviews-section"
import FrequentlyBoughtTogetherSection from "../sections/12-frequently-bought-together-section"
import RelatedRecentlyViewedSection from "../sections/13-related-recently-viewed-section"

// Import actions
import { addToCart } from "@/lib/actions/cart"
import { toggleFavorite, checkIsFavorite } from "@/lib/actions/user-lists"
import { addToQuoteBasket } from "@/lib/actions/quote-basket"

interface CatalogContext {
  from?: string
  category?: string
  application?: string
  search?: string
}

interface MobileProductDetailPageProps {
  product: Product
  relatedProducts?: Product[]
  bundleProducts?: Product[]
  catalogContext?: CatalogContext
}

export default function MobileProductDetailPage({
  product,
  relatedProducts = [],
  bundleProducts = [],
  catalogContext
}: MobileProductDetailPageProps) {
  const { user } = useUser()
  const router = useRouter()
  const reviewsSectionRef = useRef<HTMLDivElement>(null)
  const imageScrollRef = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const ctaSectionRef = useRef<HTMLDivElement>(null)
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPending, startTransition] = useTransition()

  // User type and pricing logic
  const isGuest = !user
  const accountType = user?.unsafeMetadata?.accountType as string | undefined
  const isBusiness = accountType === "business"
  const isVerified = user?.unsafeMetadata?.is_verified === true
  const showPrice = isBusiness && isVerified

  const price = product.price?.amount || 0
  const originalPrice = (product.metadata?.compare_at_price as number) || null

  // Check favorite status on mount
  useEffect(() => {
    if (user && product.id) {
      checkIsFavorite(product.id).then(result => {
        setIsFavorite(result.isFavorite)
      })
    }
  }, [user, product.id])

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

  // Handlers
  const handleAddToCart = (quantity: number) => {
    startTransition(async () => {
      try {
        await addToCart(product.id, quantity)
        toast.success(`${product.title} added to cart`)
      } catch (error: any) {
        toast.error(error.message || "Failed to add to cart")
      }
    })
  }

  const handleRequestQuote = () => {
    startTransition(async () => {
      try {
        const result = await addToQuoteBasket({
          id: `${product.id}-${Date.now()}`,
          product_id: product.id,
          product_name: product.title || "",
          product_sku: (product.metadata?.sku as string) || product.id,
          product_thumbnail: product.thumbnail || "",
          quantity: 1,
          bulk_pricing_requested: false
        })

        if (result.success) {
          toast.success("Added to quote basket")
          router.push("/quote")
        } else {
          toast.error(result.error || "Failed to add to quote basket")
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to request quote")
      }
    })
  }

  const handleWishlist = () => {
    if (isGuest) {
      toast.error("Please sign in to save favorites")
      return
    }

    startTransition(async () => {
      try {
        const result = await toggleFavorite(product.id)
        if (result.success) {
          setIsFavorite(result.isFavorite || false)
          toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites")
        } else {
          toast.error(result.error || "Failed to update favorites")
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update favorites")
      }
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description || "",
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  const handleAddBundle = () => {
    startTransition(async () => {
      try {
        await addToCart(product.id, 1)
        for (const bundleProduct of bundleProducts) {
          await addToCart(bundleProduct.id, 1)
        }
        toast.success("Bundle added to cart")
      } catch (error: any) {
        toast.error(error.message || "Failed to add bundle")
      }
    })
  }

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  .scrollbar - hide {
  -ms - overflow - style: none;
  scrollbar - width: none;
}
        .scrollbar - hide:: -webkit - scrollbar {
  display: none;
}
        .pb - safe {
  padding - bottom: env(safe - area - inset - bottom);
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
                    alt={`${product.title} - View ${i + 1} `}
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
                className={`h - 1.5 rounded - full transition - all ${i === currentImageIndex ? "bg-white w-6" : "bg-white/50 w-1.5"
                  } `}
                aria-label={`Go to image ${i + 1} `}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Variant Selector - Under Image */}
          {variants.length > 0 && (
            <div className="bg-white -mx-4 px-4 py-4">
              {variants.map((variantGroup) => {
                const [selectedVariant, setSelectedVariant] = useState("")

                return (
                  <div key={variantGroup.type} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {variantGroup.type}
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {variantGroup.options.map((option: any) => {
                        const isSelected = selectedVariant === option.id
                        const isDisabled = !option.inStock

                        return (
                          <button
                            key={option.id}
                            onClick={() => !isDisabled && setSelectedVariant(option.id)}
                            disabled={isDisabled}
                            className={`
px - 6 py - 3 rounded - xl font - medium text - base transition - all
                              ${isSelected
                                ? "bg-blue-50 text-blue-600 border-2 border-blue-500"
                                : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                              }
                              ${isDisabled
                                ? "opacity-40 cursor-not-allowed"
                                : "cursor-pointer"
                              }
`}
                          >
                            {option.value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Product Info - Order: Badges → Title → Description → SKU → Stars → Price → Buttons */}
          <div className="bg-white -mx-4 px-4 py-4 space-y-4">
            <TitleBadgesSection
              title={product.title || ""}
              badges={badges}
              sku={product.id}
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

            <div ref={ctaSectionRef}>
              <CTAButtonsSection
                isGuest={isGuest}
                isBusiness={isBusiness}
                isVerified={isVerified}
                accountType={accountType}
                onAddToCart={handleAddToCart}
                onRequestQuote={handleRequestQuote}
                onWishlist={handleWishlist}
                onShare={handleShare}
              />
            </div>
          </div>

          {/* Product Tabs: Description, Attributes */}
          <ProductTabsSection
            description={product.description || ""}
            features={features}
            specifications={specifications}
          />

          {/* Frequently Bought Together */}
          {bundleProducts.length > 0 && (
            <FrequentlyBoughtTogetherSection
              mainProduct={product}
              bundleProducts={bundleProducts}
              onAddBundle={handleAddBundle}
              isMobile={true}
            />
          )}

          {/* Reviews Section - Full Detail */}
          <ReviewsSection
            ref={reviewsSectionRef}
            reviews={reviews}
            productId={product.id}
          />

          {/* Related + Recently Viewed */}
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
          className={`fixed bottom - 0 left - 0 right - 0 bg - white border - t border - gray - 200 shadow - lg transition - transform duration - 300 z - 50 ${showFloatingBar ? 'translate-y-0' : 'translate-y-full'
            } `}
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

              {/* Action Buttons - Based on User Type */}
              <div className="flex gap-2">
                {isGuest ? (
                  <Link
                    href="/sign-in"
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Login
                  </Link>
                ) : accountType === "individual" ? (
                  <Link
                    href="/profile/account"
                    className="px-4 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    Upgrade
                  </Link>
                ) : isBusiness && !isVerified ? (
                  <Link
                    href="/profile/verification"
                    className="px-4 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    Verify
                  </Link>
                ) : showPrice ? (
                  <button
                    onClick={() => handleAddToCart(1)}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </button>
                ) : null}

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
