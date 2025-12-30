import { Metadata } from "next"
import { getUserType } from "@/lib/auth/server"
import { listProducts, listCategories, listApplications, listElevatorTypes } from "@/lib/data"
import { getCollectionsForDisplay, getCollectionBySlug } from "@/lib/actions/collections"
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

export default async function HomePage() {
  // Get user type from Clerk
  const userType = await getUserType()

  // Fetch products from Medusa backend
  const { response } = await listProducts({
    queryParams: { limit: 20 }
  })

  const products = response.products

  // Fetch categories
  const categories = await listCategories({
    parent_id: null,
    include_descendants_tree: true
  })

  // Fetch applications
  const applications = await listApplications()

  // Fetch elevator types
  const elevatorTypes = await listElevatorTypes()

  // Fetch collections for the "House" location (for ProductsTab)
  const { collections: rawCollections } = await getCollectionsForDisplay("House")
  // Serialize to ensure only plain objects are passed to client components
  const collections = JSON.parse(JSON.stringify(rawCollections))

  // Fetch trending collection (for CategoriesTab)
  const { collection: rawTrendingCollection } = await getCollectionBySlug("trending")
  // Serialize to ensure only plain objects are passed to client components
  const trendingCollection = rawTrendingCollection ? JSON.parse(JSON.stringify(rawTrendingCollection)) : null

  // Fetch top applications collection (for CategoriesTab)
  const { collection: rawTopApplicationsCollection } = await getCollectionBySlug("top-applications")
  // Serialize to ensure only plain objects are passed to client components
  const topApplicationsCollection = rawTopApplicationsCollection ? JSON.parse(JSON.stringify(rawTopApplicationsCollection)) : null

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

  // For logged-in users, show the dashboard-style layout
  if (userType !== "guest") {
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
            trendingCollection={trendingCollection}
            topApplicationsCollection={topApplicationsCollection}
          />
        </div>

        {/* Mobile View - App-like UI */}
        <div className="block md:hidden">
          <MobileHomepageLoggedIn
            products={serializedProducts}
            categories={serializedCategories}
            userType={userType}
          />
        </div>
      </>
    )
  }

  // For guest users, show the marketing-focused layout
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
        />
      </div>

      {/* Mobile View - App-like UI */}
      <div className="block md:hidden">
        <MobileHomepageGuest
          products={serializedProducts}
          categories={serializedCategories}
          testimonials={serializedTestimonials}
        />
      </div>
    </>
  )
}
