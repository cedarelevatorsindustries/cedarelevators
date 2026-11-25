import { Metadata } from "next"
import { listProducts, listCategories, listApplications, listElevatorTypes } from "@/lib/data"
import { getCollectionsWithProductsByDisplayContext } from "@/lib/actions/collections-display-context"
import { getStoreSettings } from "@/lib/services/settings"
import { CompactHero } from "@/components/home/compact-hero"
import { HomepagePromotionBanner } from "@/components/home/homepage-promotion-banner"
import { ShopByApplication } from "@/components/home/shop-by-application"
import { ProductCategoriesSection } from "@/components/home/product-categories-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { ShopByElevatorType } from "@/components/home/shop-by-elevator-type"
import { ExclusiveCedar } from "@/components/home/exclusive-cedar"
import { WhyChooseCedar } from "@/components/home/why-choose-cedar"
import { AboutCedarCta } from "@/components/home/about-cedar-cta"
import { FaqAccordion } from "@/components/home/faq-accordion"

export const metadata: Metadata = {
  title: "Cedar Elevators - Quality Elevator Components & Spare Parts",
  description: "Explore elevator components, spare parts and solutions for modern vertical transportation. Browse products by application, category, and elevator type.",
}

// Enable Incremental Static Regeneration with 1-hour revalidation
export const revalidate = 3600 // 1 hour

export default async function HomePage() {
  // Fetch all core B2B catalogue data in parallel
  const [
    { response },
    categories,
    applications,
    elevatorTypes,
    { collections: rawCollections },
    storeSettingsResult
  ] = await Promise.all([
    listProducts({ queryParams: { limit: 20 } }),
    listCategories({ parent_id: null, include_descendants_tree: true }),
    listApplications(),
    listElevatorTypes(),
    getCollectionsWithProductsByDisplayContext("homepage"),
    getStoreSettings()
  ])

  const storeSettings = storeSettingsResult?.data

  // Sort products to ensure products with valid Cloudinary photography appear first
  const rawProducts = response?.products || []
  const sortedProducts = [...rawProducts].sort((a, b) => {
    const aHasImg = Boolean(a.thumbnail || (Array.isArray(a.images) && a.images.length > 0))
    const bHasImg = Boolean(b.thumbnail || (Array.isArray(b.images) && b.images.length > 0))
    if (aHasImg && !bHasImg) return -1
    if (!aHasImg && bHasImg) return 1
    return 0
  })

  // Transform collections to flatten product structure
  const collections = (rawCollections || []).map((collection: any) => ({
    ...collection,
    products: (collection.products || []).map((pc: any) => {
      const product = pc.product || pc
      const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
      return {
        id: product.id,
        title: product.name || product.title,
        name: product.name,
        slug: product.slug,
        handle: product.slug || product.handle,
        thumbnail: product.thumbnail || product.thumbnail_url || (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0].url : null),
        description: product.description,
        images: parsedImages,
        price: product.price,
        compare_at_price: product.compare_at_price,
        variants: product.variants || product.product_variants || [],
        product_variants: product.product_variants || [],
        metadata: product.metadata || {}
      }
    })
  }))

  // Serialize all data to ensure plain objects for components
  const serializedProducts = JSON.parse(JSON.stringify(sortedProducts))
  const serializedCategories = JSON.parse(JSON.stringify(categories || []))
  const serializedApplications = JSON.parse(JSON.stringify(applications || []))
  const serializedElevatorTypes = JSON.parse(JSON.stringify(elevatorTypes || []))

  return (
    <div className="w-full bg-white flex flex-col min-h-screen overflow-x-hidden pb-20 md:pb-0">
      {/* SECTION 02 - COMPACT HERO */}
      <CompactHero />

      {/* OPTIONAL PROMOTIONAL BANNER */}
      <HomepagePromotionBanner promotion={storeSettings?.homepage_promotion} />

      {/* SECTION 03 - SHOP BY APPLICATION */}
      <ShopByApplication applications={serializedApplications} />

      {/* SECTION 05 - BROWSE PRODUCT CATEGORIES */}
      <ProductCategoriesSection categories={serializedCategories} />

      {/* SECTION 06 - FEATURED PRODUCTS */}
      <FeaturedProducts products={serializedProducts} />

      {/* SECTION 07 - SHOP BY ELEVATOR TYPE */}
      <ShopByElevatorType elevatorTypes={serializedElevatorTypes} />

      {/* SECTION 08 - EXCLUSIVE AT CEDAR */}
      <ExclusiveCedar collections={collections} />

      {/* SECTION 09 - WHY CHOOSE CEDAR? */}
      <WhyChooseCedar />

      {/* SECTION 10 - ABOUT CEDAR + DARK CONVERSION CTA */}
      <AboutCedarCta />

      {/* SECTION 11 - FREQUENTLY ASKED QUESTIONS */}
      <FaqAccordion />
    </div>
  )
}
