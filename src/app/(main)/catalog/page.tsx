import { Metadata } from "next"
import { listProducts } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import { getApplicationBySlug, listApplications } from "@/lib/data/applications"
import { listElevatorTypes } from "@/lib/data/elevator-types"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"
import { getBannersByPlacement } from "@/lib/actions/banners"
import { BannerWithSlides } from "@/lib/types/banners"
import { auth } from "@clerk/nextjs/server"

export const metadata: Metadata = {
  title: "Product Catalog - Cedar Elevators | Premium Elevator Components",
  description: "Browse our complete catalog of premium elevator components. ISO certified quality with pan-India delivery.",
}

interface CatalogPageProps {
  searchParams: Promise<{
    type?: string
    category?: string
    application?: string
    search?: string
    view?: string
    tab?: string
    app?: string
  }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams

  // Check authentication
  const { userId } = await auth()
  const isAuthenticated = !!userId

  // Build query params based on search params
  const queryParams: any = { limit: 100 }

  if (params.search) {
    queryParams.q = params.search
  }

  // Active category state
  let activeCategory = null

  // If category slug is provided, look up the category to get its ID
  if (params.category) {
    const { getCategory, listCategories } = await import('@/lib/data/categories')
    const category = await getCategory(params.category)
    if (category) {
      queryParams.category_id = [category.id]

      // Fetch subcategories (children) for this category to show in banner
      // Note: Currently returns empty as categories have flat structure
      const children = await listCategories({ parent_id: category.id })

      activeCategory = {
        ...category,
        category_children: children
      }
    }
  }

  // If application slug is provided, fetch the application and get its categories
  // Support both 'application' and 'app' parameters for compatibility
  const applicationSlug = params.application || params.app
  let activeApplication: any = undefined
  if (applicationSlug) {
    const application = await getApplicationBySlug(applicationSlug)
    if (application) {
      activeApplication = application

      // Products don't have application_id - they're linked through categories
      // So we need to get categories linked to this application
      const { getApplicationCategories } = await import('@/lib/actions/application-categories')
      const categoriesResult = await getApplicationCategories(application.id)

      if (categoriesResult.success && categoriesResult.links.length > 0) {
        // Extract category IDs from the application categories
        const categoryIds = categoriesResult.links.map((link: any) => link.category.id)
        queryParams.category_id = categoryIds
        console.log('[CATALOG] Application categories found:', categoryIds)
      } else {
        console.log('[CATALOG] No categories found for application:', application.id, categoriesResult)
      }
    }
  }

  // Fetch from Medusa
  const { response } = await listProducts({ queryParams })
  const products = response.products

  const categories = await listCategories({
    parent_id: null,
    include_descendants_tree: true
  })

  // Fetch banners for carousel
  const { banners = [] } = await getBannersByPlacement('hero-carousel')

  // Fetch all applications for mobile view
  const applications = await listApplications()

  // Fetch elevator types for mobile categories tab
  const elevatorTypes = await listElevatorTypes()

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <CatalogTemplate
          products={products}
          categories={categories}
          activeCategory={activeCategory || undefined}
          activeApplication={activeApplication}
          searchParams={params}
          banners={banners as BannerWithSlides[]}
          tab={params.tab}
          app={applicationSlug}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileCatalogTemplate
          products={products}
          categories={categories}
          applications={applications}
          elevatorTypes={elevatorTypes}
          activeCategory={activeCategory || undefined}
          activeApplication={activeApplication}
          banners={banners as BannerWithSlides[]}
          tab={params.tab}
          app={applicationSlug}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </>
  )
}

