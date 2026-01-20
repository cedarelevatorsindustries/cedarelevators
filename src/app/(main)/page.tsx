import { Metadata } from "next"
import { getUserType } from "@/lib/auth/server"
import { listProducts, listCategories, listApplications, listElevatorTypes } from "@/lib/data"
import { getCollectionsWithProductsByDisplayContext } from "@/lib/actions/collections-display-context"
import { getBusinessHubData } from "@/lib/actions/business-hub"
import { getWhyChoosePublicDataAction } from "@/lib/actions/why-choose-cms"
import {
  DesktopHomepage,
  DesktopHomepageLoggedIn,
  MobileHomepage,
  MobileHomepageGuest,
  MobileHomepageLoggedIn
} from "@/modules/home"

export const metadata: Metadata = {
  title: "Cedar Elevators - Quality Elevator Components & Parts",
  description: "Shop quality elevator components and spare parts online. Find safety gear, door operators, controllers, and more for your elevator maintenance and installation needs.",
}

// Enable Incremental Static Regeneration with 1-hour revalidation
export const revalidate = 3600 // 1 hour

export default async function HomePage() {
  // Get user type from Clerk
  const userType = await getUserType()
  const isGuest = userType === "guest"

  // Fetch all data in parallel for better performance
  const [
    { response },
    categories,
    applications,
    elevatorTypes,
    { collections: rawCollections },
    { collections: rawCategoriesCollections },
    { collections: rawBusinessHubCollections },
    { collections: rawGuestCollections },
    whyChooseResult,
  ] = await Promise.all([
    listProducts({ queryParams: { limit: 20 } }),
    listCategories({ parent_id: null, include_descendants_tree: true }),
    listApplications(),
    listElevatorTypes(),
    getCollectionsWithProductsByDisplayContext("homepage"),
    getCollectionsWithProductsByDisplayContext("categories"),
    getCollectionsWithProductsByDisplayContext("business_hub"),
    // Fetch guest-safe collections (show_in_guest = true)
    getCollectionsWithProductsByDisplayContext("homepage", undefined, true),
    getWhyChoosePublicDataAction(),
  ])

  const products = response.products

  // Transform collections to flatten nested product structure (for all users)
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

  const categoriesCollections = (rawCategoriesCollections || []).map((collection: any) => ({
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

  const businessHubCollections = (rawBusinessHubCollections || []).map((collection: any) => ({
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

  // Transform guest collections to flatten nested product structure
  const guestCollections = (rawGuestCollections || []).map((collection: any) => ({
    ...collection,
    products: (collection.products || []).map((pc: any) => {
      const product = pc.product || pc
      const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
      return {
        id: product.id,
        title: product.name,
        name: product.name,
        slug: product.slug,
        handle: product.slug,
        thumbnail: product.thumbnail || product.thumbnail_url || (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0].url : null),
        images: parsedImages,
        price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
        compare_at_price: product.compare_at_price,
        // CRITICAL: Include variants for stock display
        variants: product.variants || product.product_variants || [],
        product_variants: product.product_variants || [],
        metadata: product.metadata || {}
      }
    })
  }))

  // Fetch Business Hub data for business users (both unverified and verified)
  let businessHubData = null
  if (userType === "business" || userType === "verified") {
    const result = await getBusinessHubData()
    if (result.success) {
      businessHubData = result.data
    }
  }

  // Extract testimonials from product metadata (if available)
  const testimonials: any[] = []
  response.products.forEach((product: any) => {
    const productTestimonials = product.metadata?.testimonials as any[]
    if (Array.isArray(productTestimonials)) {
      testimonials.push(...productTestimonials)
    }
  })

  // Serialize all data to ensure only plain objects are passed to client components
  const serializedProducts = JSON.parse(JSON.stringify(products))
  const serializedCategories = JSON.parse(JSON.stringify(categories))
  const serializedApplications = JSON.parse(JSON.stringify(applications))
  const serializedElevatorTypes = JSON.parse(JSON.stringify(elevatorTypes))
  const serializedTestimonials = JSON.parse(JSON.stringify(testimonials))

  // Extract popular search terms from product names (limit to 7)
  const popularSearchTerms = serializedProducts
    .filter((p: any) => p.status === 'active' && p.name)
    .slice(0, 7)
    .map((p: any) => p.name)

  // Extract Why Choose items from CMS (serialize to remove undefined/null)
  const whyChooseItems = whyChooseResult.data?.items
    ? JSON.parse(JSON.stringify(whyChooseResult.data.items))
    : []

  // For logged-in users, show the dashboard-style layout
  if (!isGuest) {
    return (
      <>
        {/* Desktop View - Website-like UI */}
        <div className="hidden md:block">
          <DesktopHomepageLoggedIn
            products={serializedProducts}
            testimonials={serializedTestimonials}
            userType={userType}
            categories={serializedCategories}
            applications={serializedApplications}
            elevatorTypes={serializedElevatorTypes}
            collections={collections}
            categoriesCollections={categoriesCollections}
            businessHubCollections={businessHubCollections}
            businessHubData={businessHubData}
            popularSearchTerms={popularSearchTerms}
          />
        </div>

        {/* Mobile View - App-like UI */}
        <div className="block md:hidden">
          <MobileHomepageLoggedIn
            products={serializedProducts}
            categories={serializedCategories}
            userType={userType}
            collections={collections}
            applications={serializedApplications}
          />
        </div>
      </>
    )
  }

  // For guest users, show the marketing-focused layout with guest-safe collections
  return (
    <>
      {/* Desktop View - Website-like UI */}
      <div className="hidden md:block">
        <DesktopHomepage
          products={serializedProducts}
          categories={serializedCategories}
          testimonials={serializedTestimonials}
          applications={serializedApplications}
          elevatorTypes={serializedElevatorTypes}
          collections={guestCollections}
          whyChooseItems={whyChooseItems}
        />
      </div>

      {/* Mobile View - App-like UI */}
      <div className="block md:hidden">
        <MobileHomepageGuest
          products={serializedProducts}
          categories={serializedCategories}
          applications={serializedApplications}
          elevatorTypes={serializedElevatorTypes}
          testimonials={serializedTestimonials}
          collections={guestCollections}
        />
      </div>
    </>
  )
}
