import { Metadata } from "next"
import { getUserType } from "@/lib/auth/server"
import { listProducts, listCategories, listApplications, listElevatorTypes } from "@/lib/data"
import { getCollectionsWithProductsByDisplayContext } from "@/lib/actions/collections-display-context"
import { getBusinessHubData } from "@/lib/actions/business-hub"
import {
  DesktopHomepage,
  DesktopHomepageLoggedIn,
  MobileHomepage,
  MobileHomepageGuest,
  MobileHomepageLoggedIn
} from "@/modules/home"

export const metadata: Metadata = {
  title: "Cedar Elevators - Premium Lift Components | B2B Marketplace",
  description: "India's leading B2B marketplace for premium elevator components. ISO certified quality, pan-India delivery, and 2-year warranty on all products.",
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
  ])

  const products = response.products
  const collections = JSON.parse(JSON.stringify(rawCollections))
  const categoriesCollections = JSON.parse(JSON.stringify(rawCategoriesCollections))
  const businessHubCollections = JSON.parse(JSON.stringify(rawBusinessHubCollections))

  // Transform guest collections to flatten nested product structure
  const guestCollections = (rawGuestCollections || []).map((collection: any) => ({
    ...collection,
    products: (collection.products || []).map((pc: any) => {
      const product = pc.product || pc
      return {
        id: product.id,
        title: product.name,
        name: product.name,
        slug: product.slug,
        handle: product.slug,
        thumbnail: product.thumbnail_url || product.thumbnail,
        price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
      }
    })
  }))

  // Fetch Business Hub data for business users
  let businessHubData = null
  if (userType === "business") {
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
