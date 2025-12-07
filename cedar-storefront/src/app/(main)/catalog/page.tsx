import { Metadata } from "next"
import { listProducts } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import { demoProducts } from "@/lib/data/demo-products"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"
import { HttpTypes } from "@medusajs/types"

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
  }>
}

// Demo categories for testing
const demoCategories: HttpTypes.StoreProductCategory[] = [
  {
    id: "cat_control_panels",
    name: "Control Panels",
    handle: "control-panels",
    description: "",
    rank: 0,
    parent_category_id: "",
    parent_category: null,
    category_children: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
  {
    id: "cat_door_operators",
    name: "Door Operators",
    handle: "door-operators",
    description: "",
    rank: 1,
    parent_category_id: "",
    parent_category: null,
    category_children: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
  {
    id: "cat_limit_switches",
    name: "Limit Switches",
    handle: "limit-switches",
    description: "",
    rank: 2,
    parent_category_id: "",
    parent_category: null,
    category_children: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
  {
    id: "cat_ard_systems",
    name: "ARD Systems",
    handle: "ard-systems",
    description: "",
    rank: 3,
    parent_category_id: "",
    parent_category: null,
    category_children: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
  {
    id: "cat_guide_shoes",
    name: "Guide Shoes",
    handle: "guide-shoes",
    description: "",
    rank: 4,
    parent_category_id: "",
    parent_category: null,
    category_children: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
] as HttpTypes.StoreProductCategory[]

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams

  // Try to fetch from Medusa, fallback to demo data
  let products: HttpTypes.StoreProduct[] = demoProducts as HttpTypes.StoreProduct[]
  let categories: HttpTypes.StoreProductCategory[] = demoCategories

  try {
    const { response } = await listProducts({
      queryParams: { limit: 100 }
    })
    
    const medusaCategories = await listCategories()
    
    // Use Medusa data if available
    if (response.products.length > 0) {
      products = response.products
    }
    
    if (medusaCategories.length > 0) {
      categories = medusaCategories
    }
  } catch (error) {
    console.log("Using demo data:", error)
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <CatalogTemplate
          products={products}
          categories={categories}
          searchParams={params}
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
