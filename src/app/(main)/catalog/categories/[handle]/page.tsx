import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategory, listCategories } from "@/lib/data/categories"
import { listProducts } from "@/lib/data/products"
import { getCategorySubcategories } from "@/lib/actions/category-subcategories"
import CatalogTemplate from "@/modules/catalog/templates/catalog-template"
import { MobileCatalogTemplate } from "@/modules/catalog/templates/mobile"

interface CategoryPageProps {
    params: Promise<{
        handle: string
    }>
    searchParams: Promise<{
        search?: string
        view?: string
        subcategory?: string  // Added for subcategory filtering
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

    // Get CURATED subcategories for this category via junction table
    const { success, links } = await getCategorySubcategories(category.id)
    const curatedSubcategories = success
        ? links.map(link => ({
            ...link.subcategory,
            name: link.subcategory.title,  // Map title to name for ProductCategory type compatibility
            handle: link.subcategory.slug,  // Map slug to handle for compatibility
            slug: link.subcategory.slug,    // Keep slug for URL generation
            thumbnail: link.subcategory.thumbnail || link.subcategory.thumbnail_image,  // Prioritize thumbnail field
            thumbnail_image: link.subcategory.thumbnail || link.subcategory.thumbnail_image,  // Same value
            sort_order: link.sort_order  // From junction table
        })).sort((a, b) => a.sort_order - b.sort_order)
        : []

    // Construct activeCategory with curated children for the banner
    const activeCategory = {
        ...category,
        category_children: curatedSubcategories
    }

    // Build query params
    const queryParams: any = {
        limit: 100,
        category_id: [category.id]
    }

    // If a subcategory is selected in URL, filter by it
    if (searchParamsResolved.subcategory) {
        // Find the subcategory by slug to get its ID
        const selectedSubcat = curatedSubcategories.find(
            sub => sub.slug === searchParamsResolved.subcategory || sub.id === searchParamsResolved.subcategory
        )
        if (selectedSubcat) {
            queryParams.subcategory_id = selectedSubcat.id
        }
    }

    if (searchParamsResolved.search) {
        queryParams.q = searchParamsResolved.search
    }

    // Fetch products in this category
    const { response } = await listProducts({ queryParams })
    const products = response.products

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
        subcategory: searchParamsResolved.subcategory,  // Pass subcategory filter to template
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
