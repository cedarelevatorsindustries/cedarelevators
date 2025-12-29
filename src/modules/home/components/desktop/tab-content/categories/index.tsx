import { ProductCategory } from "@/lib/types/domain"
import ShopByCategories from "./sections/shop-by-categories"
import ShopByElevatorType from "./sections/shop-by-elevator-type"
import TopApplications from "./sections/top-applications"
import DynamicCollectionSection from "@/components/common/DynamicCollectionSection"
import { getCollectionBySlug } from "@/lib/actions/collections"
import CategoryHelp from "./sections/category-help"

interface CategoriesTabProps {
  categories?: ProductCategory[]
}

export default async function CategoriesTab({ categories = [] }: CategoriesTabProps) {
  // Get the trending collection from database
  const { collection: dbCollection } = await getCollectionBySlug("trending")

  // Transform database collection to match expected format
  const trendingCollection = dbCollection ? {
    id: dbCollection.id,
    title: dbCollection.title,
    description: dbCollection.description,
    slug: dbCollection.slug,
    displayLocation: [],
    layout: 'grid-4',
    icon: 'trending',
    viewAllLink: '/products?sort=trending',
    products: (dbCollection.products || []).map((pc: any) => {
      const product = pc.product
      return {
        id: product.id,
        title: product.name,
        name: product.name,
        slug: product.slug,
        handle: product.slug,
        thumbnail: product.thumbnail,
        price: product.price ? { amount: product.price, currency_code: 'INR' } : undefined,
        variants: [],
        metadata: { variant: 'special' }
      }
    }),
    isActive: dbCollection.is_active,
    sortOrder: dbCollection.sort_order,
    showViewAll: true,
    metadata: { variant: 'special' }
  } : null

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-12">
      {/* 1. Shop by Categories - 2 line horizontal scroll */}
      <ShopByCategories categories={categories} />

      {/* 2. Trending Collections - Now from database */}
      {trendingCollection && (
        <DynamicCollectionSection collection={trendingCollection} />
      )}

      {/* 3. Shop by Elevator Type - 2 rows, 5 grid */}
      <ShopByElevatorType />

      {/* 4. Top Applications - same as Trending Collections style */}
      <TopApplications />

      <CategoryHelp />
    </div>
  )
}
