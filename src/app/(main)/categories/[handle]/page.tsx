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

  // Fetch subcategories (children) for this category to show in banner
  // Note: Currently returns empty as categories have flat structure
  // TODO: Create subcategories for each main category
  const children = await listCategories({ parent_id: category.id })

  // Construct activeCategory with children for the banner
  const activeCategory = {
    ...category,
    category_children: children
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

  // Debug logging
  console.log('Category Page Debug:', {
    categoryId: category.id,
    categoryName: category.name,
    productsCount: products.length,
    childrenCount: children.length,
    queryParams,
    firstProduct: products[0] ? {
      id: products[0].id,
      title: products[0].title
    } : null
  })

  // Get all categories for filter sidebar
  const categories = await listCategories({
    parent_id: null,
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
          activeCategory={activeCategory}
          searchParams={catalogSearchParams}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileCatalogTemplate
          products={products}
          categories={categories}
          activeCategory={activeCategory}
        />
      </div>
    </>
  )
}
