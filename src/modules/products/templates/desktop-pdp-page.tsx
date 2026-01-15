"use client"

import { Product } from "@/lib/types/domain"
import { useUser } from "@/lib/auth/client"
import { useUserPricing } from "@/lib/hooks/useUserPricing"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Import desktop sections
import ProductHeroSection from "../sections/01-product-hero-section"
import TitleBadgesSection from "../sections/02-title-badges-section"
import PricingBlockSection from "../sections/04-pricing-block-section"
import ProductTabsSection from "../sections/14-product-tabs-section"
import ReviewsSection from "../sections/15-reviews-section"
import FrequentlyBoughtTogetherSection from "../sections/12-frequently-bought-together-section"
import RelatedRecentlyViewedSection from "../sections/13-related-recently-viewed-section"
import VariantSelector from "../components/product/variant-selector"
import { useRef, useState, useEffect, useTransition } from "react"

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
  const router = useRouter()
  const reviewsSectionRef = useRef<HTMLDivElement>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPending, startTransition] = useTransition()

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
  const specifications = product.specifications?.map(s => ({ label: s.key, value: s.value })) || [
    { label: "SKU", value: product.id },
    { label: "Category", value: product.category_id || "N/A" }
  ]
  const reviews = product.metadata?.reviews as any[] || []
  const features = product.tags || []

  // Transform variants for selector
  const variants = product.variants ? (() => {
    const groups: Record<string, Set<string>> = {}

    // Collect all unique option values from options JSONB
    product.variants.forEach((v: any) => {
      if (v.options && typeof v.options === 'object') {
        Object.entries(v.options).forEach(([key, value]) => {
          if (!groups[key]) groups[key] = new Set()
          groups[key].add(value as string)
        })
      }
    })

    // Convert to selector format
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

  // Find selected variant
  const getSelectedVariantId = () => {
    if (!product.variants || product.variants.length === 0) return product.id

    // Find variant matching selected options
    const matchingVariant = product.variants.find((v: any) => {
      if (!v.options || typeof v.options !== 'object') return false

      return Object.entries(selectedVariants).every(([key, value]) =>
        v.options[key] === value
      )
    })
    return matchingVariant?.id || product.variants[0]?.id || product.id
  }

  // Get selected variant title
  const getSelectedVariantTitle = () => {
    if (!product.variants || product.variants.length === 0 || !allVariantsSelected) return undefined

    const matchingVariant = product.variants.find((v: any) => {
      if (!v.options || typeof v.options !== 'object') return false
      return Object.entries(selectedVariants).every(([key, value]) =>
        v.options[key] === value
      )
    })
    return matchingVariant?.variant_title
  }

  // Handlers
  const handleVariantChange = (variantType: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantType]: variantId }))
  }

  const handleAddToCart = (quantity: number) => {
    if (!allVariantsSelected) {
      toast.error("Please select all options")
      return
    }

    startTransition(async () => {
      try {
        const variantId = getSelectedVariantId()
        const result = await addItemToCart({
          productId: product.id,
          variantId: variantId || undefined,
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
        // Add main product
        await addItemToCart({ productId: product.id, quantity: 1 })
        // Add bundle products
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
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }
    )
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
                    selectedVariantTitle={getSelectedVariantTitle()}
                    onVariantChange={handleVariantChange}
                  />
                )}

                {/* Pricing Block */}
                <PricingBlockSection
                  price={price}
                  originalPrice={originalPrice}
                  onAddToCart={handleAddToCart}
                  onRequestQuote={handleRequestQuote}
                  actionDisabled={!allVariantsSelected}
                  productId={product.id}
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
      </div >
    </>
  )
}

