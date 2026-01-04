import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"

interface TypePageProps {
    params: Promise<{
        handle: string
    }>
    searchParams: Promise<{
        search?: string
        view?: string
    }>
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
    const { handle } = await params

    // TODO: Fetch elevator type details from database
    const typeName = handle.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    return {
        title: `${typeName} - Cedar Elevators | Premium Elevator Components`,
        description: `Browse elevator components for ${typeName}`,
    }
}

export default async function TypePage({ params, searchParams }: TypePageProps) {
    const { handle } = await params
    const searchParamsResolved = await searchParams

    // TODO: Fetch elevator type details from database
    // For now, create a mock type object
    const elevatorType = {
        id: handle,
        name: handle.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        handle: handle,
        description: `Premium components for ${handle}`,
    }

    // Build query params - filter by type
    const queryParams: any = {
        limit: 100,
        type: handle
    }

    if (searchParamsResolved.search) {
        queryParams.q = searchParamsResolved.search
    }

    // Fetch products for this type
    const { response } = await listProducts({ queryParams })
    const products = response.products

    // Get all categories for filter sidebar
    const categories = await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })

    // Construct activeType object for banner
    const activeType = {
        ...elevatorType
    }

    // Create search params object for template
    const catalogSearchParams = {
        type: 'elevator-type',
        elevatorType: handle,
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
                    activeType={activeType}
                    searchParams={catalogSearchParams}
                />
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileCatalogTemplate
                    products={products}
                    categories={categories}
                    activeType={activeType}
                />
            </div>
        </>
    )
}
