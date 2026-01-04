import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"

interface CollectionPageProps {
    params: Promise<{
        handle: string
    }>
    searchParams: Promise<{
        search?: string
        view?: string
    }>
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
    const { handle } = await params

    // TODO: Fetch collection details from database
    const collectionName = handle.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    return {
        title: `${collectionName} Collection - Cedar Elevators | Premium Elevator Components`,
        description: `Browse our ${collectionName} collection of elevator components`,
    }
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
    const { handle } = await params
    const searchParamsResolved = await searchParams

    // TODO: Fetch collection details and products from database
    // For now, create a mock collection object
    const collection = {
        id: handle,
        name: handle.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        handle: handle,
        description: `Curated collection of ${handle} products`,
    }

    // Build query params - filter by collection
    const queryParams: any = {
        limit: 100,
        collection: handle
    }

    if (searchParamsResolved.search) {
        queryParams.q = searchParamsResolved.search
    }

    // Fetch products for this collection
    const { response } = await listProducts({ queryParams })
    const products = response.products

    // TODO: Fetch related products
    const relatedProducts: any[] = []

    // Get all categories for filter sidebar
    const categories = await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })

    // Construct activeCollection object for banner
    const activeCollection = {
        ...collection,
        products: products,
        relatedProducts: relatedProducts
    }

    // Create search params object for template
    const catalogSearchParams = {
        type: 'collection',
        collection: handle,
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
                    activeCollection={activeCollection}
                    searchParams={catalogSearchParams}
                />
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileCatalogTemplate
                    products={products}
                    categories={categories}
                    activeCollection={activeCollection}
                />
            </div>
        </>
    )
}
