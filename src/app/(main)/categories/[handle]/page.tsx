import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategory, listCategories } from "@/lib/data/categories"
import { listProducts } from "@/lib/data/products"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"

interface CategoryPageProps {
  params: Promise<{
    handle: string
  }>
  searchParams: Promise<{
    search?: string
    view?: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { handle } = await params
  const category = await getCategory(handle)
  
  if (!category) {
    return {
      title: 'Category Not Found - Cedar Elevators'
    }
  }

  return {
    title: `${category.name} - Cedar Elevators | Premium Elevator Components`,
    description: category.description || `Browse ${category.name} products`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { handle } = await params
  const searchParamsResolved = await searchParams
  
  // Get category details
  const category = await getCategory(handle)
  
  if (!category) {
    notFound()
  }

  // Build query params
  const queryParams: any = { 
    limit: 100,
    category_id: [category.id]
  }
  
  if (searchParamsResolved.search) {
    queryParams.q = searchParamsResolved.search
  }

  // Fetch products in this category
  const { response } = await listProducts({ queryParams })
  const products = response.products
  
  // Get all categories for filter sidebar
  const categories = await listCategories({ 
    parent_category_id: null,
    include_descendants_tree: true 
  })

  // Create search params object for template
  const catalogSearchParams = {
    type: 'category',
    category: category.id,
    search: searchParamsResolved.search,
    view: searchParamsResolved.view,
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <CatalogTemplate
          products={products}
          categories={categories}
          searchParams={catalogSearchParams}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileCatalogTemplate
          products={products}
          categories={categories}
        />
      </div>
    </>
  )
}
