import { Metadata } from "next"
import { listProducts } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"

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

  if (params.category) {
    queryParams.category_id = [params.category]
  }

  // Fetch from Medusa
  const { response } = await listProducts({ queryParams })
  const products = response.products

  const categories = await listCategories({
    parent_category_id: null,
    include_descendants_tree: true
  })

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <CatalogTemplate
          products={products}
          categories={categories}
          searchParams={params}
          tab={params.tab}
          app={params.app}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileCatalogTemplate
          products={products}
          categories={categories}
          tab={params.tab}
          app={params.app}
        />
      </div>
    </>
  )
}
