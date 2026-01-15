
"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Product } from "@/lib/types/domain"
import { useUser } from "@/lib/auth/client"
import { useUserPricing } from "@/lib/hooks/useUserPricing"
import { ChevronLeft, Share2, Heart, ShoppingCart, MessageSquare, Package } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Sections
import TitleBadgesSection from "../sections/02-title-badges-section"
import PricingBlockSection from "../sections/04-pricing-block-section"
import ProductTabsSection from "../sections/14-product-tabs-section"
import ReviewsSection from "../sections/15-reviews-section"
import FrequentlyBoughtTogetherSection from "../sections/12-frequently-bought-together-section"
import RelatedRecentlyViewedSection from "../sections/13-related-recently-viewed-section"

// Import actions
import { addItemToCart } from "@/lib/actions/cart-v2"
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
  const fullScreenScrollRef = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const ctaSectionRef = useRef<HTMLDivElement>(null)
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false)
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(0)

  // User type and pricing logic - Use hook for correct pricing visibility
  const { userType, isVerified, canSeePrices } = useUserPricing()
  const isGuest = userType === 'guest'
  const isBusiness = userType === 'business'
  const showPrice = canSeePrices

  const price = (product as any).price || product.price?.amount || 0
  const originalPrice = (product as any).compare_at_price || (product.metadata?.compare_at_price as number) || null

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
    { label: "How Numbers", value: product.category_id || "N/A" }
  ]
  const reviews = product.metadata?.reviews as any[] || []
  const features = product.metadata?.features as string[] || []

  // Transform variants from product.variants using options JSONB
  const variants = product.variants ? (() => {
    const groups: Record<string, Set<string>> = {}

    product.variants.forEach((v: any) => {
      if (v.options && typeof v.options === 'object') {
        Object.entries(v.options).forEach(([key, value]) => {
          if (!groups[key]) groups[key] = new Set()
          groups[key].add(value as string)
        })
      }
    })

    return Object.entries(groups).map(([type, values]) => ({
      type,
      options: Array.from(values).map(val => ({
        id: val,
        name: val,
        value: val,
        inStock: true
      }))
    }))
  })() : []

  // Check if all variants are selected
  const allVariantsSelected = variants.length === 0 ||
    variants.every((variantGroup: any) => selectedVariants[variantGroup.type])

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
        const result = await addItemToCart({
          productId: product.id,
          quantity
        })
        if (result.success) {
          toast.success(`${product.title} added to cart`)
        } else {
          toast.error(result.error || "Failed to add to cart")
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to add to cart")
      }
    })
  }

  const handleRequestQuote = (quantity: number = 1) => {
    const params = new URLSearchParams({
      productId: product.id,
      productName: product.title || "",
      quantity: quantity.toString()
    })
    router.push(`/quotes/new?${params.toString()}`)
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
        await addItemToCart({ productId: product.id, quantity: 1 })
        for (const bundleProduct of bundleProducts) {
          await addItemToCart({ productId: bundleProduct.id, quantity: 1 })
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

  // Sync full-screen carousel scroll with image index
  useEffect(() => {
    if (isFullScreenOpen && fullScreenScrollRef.current) {
      const scrollLeft = fullScreenImageIndex * fullScreenScrollRef.current.offsetWidth
      fullScreenScrollRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      })
    }
  }, [fullScreenImageIndex, isFullScreenOpen])

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
            {allImages.length > 0 ? (
              allImages.map((image, i) => (
                <div key={i} className="flex-shrink-0 w-full snap-center">
                  <div
                    className="aspect-[3/4] bg-white relative cursor-pointer"
                    onClick={() => {
                      setFullScreenImageIndex(i)
                      setIsFullScreenOpen(true)
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.title} - View ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full absolute inset-0 items-center justify-center bg-gray-100">
                      <Package className="w-24 h-24 text-gray-300" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-shrink-0 w-full snap-center">
                <div className="aspect-square bg-gray-100 relative flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-300" />
                </div>
              </div>
            )}
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
                className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? "bg-white w-6" : "bg-white/50 w-1.5"
                  }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-16 pb-4 px-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {allImages.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      imageScrollRef.current?.scrollTo({
                        left: i * (imageScrollRef.current?.offsetWidth || 0),
                        behavior: 'smooth'
                      })
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex
                      ? 'border-white opacity-100 scale-105'
                      : 'border-white/30 opacity-60'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Full-Screen Image Viewer Modal */}
        {isFullScreenOpen && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
              <button
                onClick={() => setIsFullScreenOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <span className="text-white text-sm font-medium">
                {fullScreenImageIndex + 1} / {allImages.length}
              </span>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Image Carousel */}
            <div
              ref={fullScreenScrollRef}
              className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
              {allImages.map((image, i) => (
                <div key={i} className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center">
                  <img
                    src={image}
                    alt={`${product.title} - View ${i + 1}`}
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const clickX = e.clientX - rect.left
                      const width = rect.width

                      if (clickX < width / 3 && fullScreenImageIndex > 0) {
                        // Click left third - previous image
                        setFullScreenImageIndex(fullScreenImageIndex - 1)
                      } else if (clickX > (width * 2) / 3 && fullScreenImageIndex < allImages.length - 1) {
                        // Click right third - next image
                        setFullScreenImageIndex(fullScreenImageIndex + 1)
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {fullScreenImageIndex > 0 && (
              <button
                onClick={() => setFullScreenImageIndex(fullScreenImageIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
            )}
            {fullScreenImageIndex < allImages.length - 1 && (
              <button
                onClick={() => setFullScreenImageIndex(fullScreenImageIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-white rotate-180" />
              </button>
            )}

            {/* Thumbnail Strip at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
                {allImages.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setFullScreenImageIndex(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === fullScreenImageIndex
                      ? 'border-white opacity-100'
                      : 'border-white/30 opacity-50'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
              description={product.description || ""}
              sku={product.metadata?.sku as string}
              rating={reviews.length > 0 ? (product.metadata?.rating as number) || 0 : undefined}
              reviewCount={reviews.length}
              onClickReviews={scrollToReviews}
            />

            <PricingBlockSection
              price={price}
              originalPrice={originalPrice}
              onAddToCart={handleAddToCart}
              onRequestQuote={handleRequestQuote}
              isMobile={true}
              productId={product.id}
            />
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
                      ₹{Number(price).toLocaleString("en-IN")}
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
                ) : userType === "individual" ? (
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
                  onClick={() => handleRequestQuote(1)}
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

