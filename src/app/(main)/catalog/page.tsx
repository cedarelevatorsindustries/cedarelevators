import { Metadata } from "next"
import { listProducts } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import { getApplicationBySlug, listApplications } from "@/lib/data/applications"
import { listElevatorTypes, getElevatorTypeBySlug } from "@/lib/data/elevator-types"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"
import { getBannersByPlacement, getBannersByCollection } from "@/lib/actions/banners"
import { BannerWithSlides } from "@/lib/types/banners"
import { auth } from "@clerk/nextjs/server"

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams

  // Search results page - support both 'q' and 'search' params
  const searchQuery = params.q || params.search
  if (searchQuery) {
    return {
      title: `Search Results for "${searchQuery}" | Cedar Elevators`,
      description: `Find ${searchQuery} and related elevator components. ISO certified quality with pan-India delivery. Browse our complete catalog of premium parts.`,
      openGraph: {
        title: `Search: ${searchQuery} | Cedar Elevators`,
        description: `Find ${searchQuery} and related elevator components with ISO certified quality.`,
      },
      keywords: `${searchQuery}, elevator parts, elevator components, Cedar Elevators`,
    }
  }

  // Category page
  if (params.category) {
    return {
      title: `${params.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - Cedar Elevators`,
      description: `Browse ${params.category.split('-').join(' ')} for elevators. Premium quality components with pan-India delivery.`,
    }
  }

  // Application page
  if (params.application || params.app) {
    const appName = (params.application || params.app)!.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return {
      title: `${appName} Components - Cedar Elevators`,
      description: `Premium elevator components for ${appName.toLowerCase()}. ISO certified quality with pan-India delivery.`,
    }
  }

  // Elevator type page
  if (params.type) {
    const typeName = params.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return {
      title: `${typeName} - Cedar Elevators | Premium Components`,
      description: `Browse premium components for ${typeName.toLowerCase()}. ISO certified quality with pan-India delivery.`,
    }
  }

  // Default catalog page
  return {
    title: "Product Catalog - Cedar Elevators | Premium Elevator Components",
    description: "Browse our complete catalog of premium elevator components. ISO certified quality with pan-India delivery.",
    openGraph: {
      title: "Product Catalog | Cedar Elevators",
      description: "Premium elevator components with ISO certified quality.",
    },
  }
}

interface CatalogPageProps {
  searchParams: Promise<{
    type?: string
    category?: string
    application?: string
    collection?: string
    search?: string
    q?: string
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

  // Support both 'q' and 'search' params for search
  const searchQuery = params.q || params.search
  if (searchQuery) {
    queryParams.q = searchQuery
  }

  // Active category state
  let activeCategory = null

  // If category slug is provided, look up the category to get its ID
  if (params.category) {
    const { getCategory } = await import('@/lib/data/categories')
    const { getSubcategoriesByParentId } = await import('@/lib/actions/subcategories')
    const category = await getCategory(params.category)
    if (category) {
      queryParams.category_id = [category.id]

      // Fetch subcategories (children) for this category to show in banner
      const subcategoriesResult = await getSubcategoriesByParentId(category.id)
      const children = subcategoriesResult.success ? subcategoriesResult.subcategories : []

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
      // Products don't have application_id - they're linked through categories
      // So we need to get categories linked to this application
      const { getApplicationCategories } = await import('@/lib/actions/application-categories')
      const categoriesResult = await getApplicationCategories(application.id)

      if (categoriesResult.success && categoriesResult.links.length > 0) {
        // Extract category IDs from the application categories
        const categoryIds = categoriesResult.links.map((link: any) => link.category.id)
        queryParams.category_id = categoryIds

        // Add categories to activeApplication for banner display
        // Map title to name for compatibility
        activeApplication = {
          ...application,
          categories: categoriesResult.links.map((link: any) => ({
            ...link.category,
            name: link.category.title || link.category.name
          }))
        }
      } else {
        activeApplication = application
      }
    }
  }

  // If elevator type is provided, fetch the type and filter by type
  let activeType: any = undefined
  if (params.type) {
    const elevatorType = await getElevatorTypeBySlug(params.type)
    if (elevatorType) {
      // Filter products by this elevator type
      queryParams.type = params.type

      activeType = elevatorType
    }
  }

  // If collection slug is provided, fetch products from that collection
  let activeCollection: any = undefined
  if (params.collection) {
    const { getCollectionBySlug } = await import('@/lib/actions/collections')
    const collectionResult = await getCollectionBySlug(params.collection)
    if (collectionResult.success && collectionResult.collection) {
      activeCollection = collectionResult.collection
      // Note: We don't filter queryParams by collection
      // The catalog will show ALL products, but highlight collection products
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
  let banners: any[] = []

  if (activeCollection) {
    // Try to get collection-specific banners
    const { banners: collectionBanners } = await getBannersByCollection(activeCollection.id)
    if (collectionBanners && collectionBanners.length > 0) {
      banners = collectionBanners
    } else {
      // Fallback to general banners
      const { banners: generalBanners } = await getBannersByPlacement('hero-carousel')
      banners = generalBanners || []
    }
  } else {
    // General catalog - show general banners
    const { banners: generalBanners } = await getBannersByPlacement('hero-carousel')
    banners = generalBanners || []
  }

  // Fetch all applications for mobile view
  const applications = await listApplications()

  // Fetch elevator types for mobile categories tab
  const elevatorTypes = await listElevatorTypes()

  // Fetch category-specific collections for mobile categories tab
  let categoryCollections: any[] = []
  if (isAuthenticated) {
    try {
      const { getCollections } = await import('@/lib/actions/collections')
      // Get category-specific collections only  
      const result = await getCollections({ collection_type: 'category_specific', is_active: true })
      // Ensure it's always an array
      categoryCollections = (result.success && Array.isArray(result.collections)) ? result.collections : []
    } catch (error) {
      console.error('Error loading category collections:', error)
      categoryCollections = []
    }
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <CatalogTemplate
          products={products}
          categories={categories}
          activeCategory={activeCategory || undefined}
          activeApplication={activeApplication}
          activeCollection={activeCollection}
          activeType={activeType}
          searchParams={{ ...params, search: searchQuery }}
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
          collections={categoryCollections}
          activeCategory={activeCategory || undefined}
          activeApplication={activeApplication}
          activeCollection={activeCollection}
          activeType={activeType}
          banners={banners as BannerWithSlides[]}
          tab={params.tab}
          app={applicationSlug}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </>
  )
}

