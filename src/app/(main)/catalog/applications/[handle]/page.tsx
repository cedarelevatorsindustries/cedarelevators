import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"

interface ApplicationPageProps {
    params: Promise<{
        handle: string
    }>
    searchParams: Promise<{
        search?: string
        view?: string
    }>
}

export async function generateMetadata({ params }: ApplicationPageProps): Promise<Metadata> {
    const { handle } = await params

    // TODO: Fetch application details from database
    const applicationName = handle.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    return {
        title: `${applicationName} Applications - Cedar Elevators | Premium Elevator Components`,
        description: `Browse elevator components for ${applicationName} applications`,
    }
}

export default async function ApplicationPage({ params, searchParams }: ApplicationPageProps) {
    const { handle } = await params
    const searchParamsResolved = await searchParams

    // TODO: Fetch application details from database
    // For now, create a mock application object
    const application = {
        id: handle,
        name: handle.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        handle: handle,
        description: `Elevator components for ${handle} applications`,
    }

    // Build query params - filter by application
    const queryParams: any = {
        limit: 100,
        application: handle
    }

    if (searchParamsResolved.search) {
        queryParams.q = searchParamsResolved.search
    }

    // Fetch products for this application
    const { response } = await listProducts({ queryParams })
    const products = response.products

    // Get all categories for filter sidebar
    const categories = await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })

    // TODO: Fetch curated categories for this application from application_categories mapping
    // For now, display all categories
    const curatedCategories = categories

    // Construct activeApplication object for banner
    const activeApplication = {
        ...application,
        categories: curatedCategories
    }

    // Create search params object for template
    const catalogSearchParams = {
        type: 'application',
        application: handle,
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
                    activeApplication={activeApplication}
                    searchParams={catalogSearchParams}
                />
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileCatalogTemplate
                    products={products}
                    categories={categories}
                    activeApplication={activeApplication}
                />
            </div>
        </>
    )
}
