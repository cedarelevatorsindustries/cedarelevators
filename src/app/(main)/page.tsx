import { Metadata } from "next"
import { getUserType } from "@/lib/auth/server"
import { listProducts, listCategories } from "@/lib/data"
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
    parent_category_id: null,
    include_descendants_tree: true
  })

  // Extract testimonials from product metadata (if available)
  const testimonials: any[] = []
  response.products.forEach((product: any) => {
    const productTestimonials = product.metadata?.testimonials as any[]
    if (Array.isArray(productTestimonials)) {
      testimonials.push(...productTestimonials)
    }
  })

  // For logged-in users, show the dashboard-style layout
  if (userType !== "guest") {
    return (
      <>
        {/* Desktop View - Website-like UI */}
        <div className="hidden md:block">
          <DesktopHomepageLoggedIn
            products={products}
            testimonials={testimonials}
            userType={userType}
            categories={categories}
          />
        </div>

        {/* Mobile View - App-like UI */}
        <div className="block md:hidden">
          <MobileHomepageLoggedIn
            products={products}
            categories={categories}
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
          products={products}
          categories={categories}
          testimonials={testimonials}
        />
      </div>

      {/* Mobile View - App-like UI */}
      <div className="block md:hidden">
        <MobileHomepageGuest
          products={products}
          categories={categories}
          testimonials={testimonials}
        />
      </div>
    </>
  )
}
