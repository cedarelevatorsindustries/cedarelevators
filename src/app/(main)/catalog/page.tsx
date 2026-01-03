import { Metadata } from "next"
import { listProducts } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"
import { getBannersByPlacement } from "@/lib/actions/banners"
import { BannerWithSlides } from "@/lib/types/banners"

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

  // If application slug is provided, add to query params for server-side filtering
  if (params.app) {
    queryParams.application = params.app
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

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <CatalogTemplate
          products={products}
          categories={categories}
          activeCategory={activeCategory || undefined}
          searchParams={params}
          banners={banners as BannerWithSlides[]}
          tab={params.tab}
          app={params.app}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileCatalogTemplate
          products={products}
          categories={categories}
          activeCategory={activeCategory || undefined}
          banners={banners as BannerWithSlides[]}
          tab={params.tab}
          app={params.app}
        />
      </div>
    </>
  )
}
