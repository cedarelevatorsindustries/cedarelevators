/**
 * Centralized Catalog Service
 * Handles data fetching strategies for different catalog types:
 * - Applications → products via curated categories
 * - Categories → products via subcategories
 * - Types → direct type products
 * - Collections → collection products + related products
 */

import { listProducts } from "@/lib/data/products"
import { listCategories, getCategory } from "@/lib/data/categories"

// ============================================================================
// Application Catalog Strategy
// ============================================================================

/**
 * Fetch products for an application by sourcing through curated categories
 * @param applicationHandle - The application slug/handle
 * @returns Products and curated categories for the application
 */
export async function fetchApplicationProducts(applicationHandle: string) {
    // TODO: Fetch application from database
    // TODO: Fetch application_categories mapping

    // For now, filter products by application query param
    const { response } = await listProducts({
        queryParams: {
            limit: 100,
            application_id: applicationHandle
        }
    })

    // Get all categories for filter sidebar
    const categories = await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })

    // TODO: Get curated categories from application_categories table
    const curatedCategories = categories

    return {
        products: response.products,
        categories: categories,
        curatedCategories: curatedCategories
    }
}

// ============================================================================
// Category Catalog Strategy
// ============================================================================

/**
 * Fetch products for a category by sourcing through subcategories
 * @param categoryHandle - The category slug/handle
 * @returns Products and subcategories for the category
 */
export async function fetchCategoryProducts(categoryHandle: string) {
    // Get category details
    const category = await getCategory(categoryHandle)

    if (!category) {
        return null
    }

    // Fetch subcategories (children) for this category
    const subcategories = await listCategories({ parent_id: category.id })

    // Fetch products in this category
    const { response } = await listProducts({
        queryParams: {
            limit: 100,
            category_id: [category.id]
        }
    })

    // Get all categories for filter sidebar
    const allCategories = await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })

    return {
        category: {
            ...category,
            category_children: subcategories
        },
        products: response.products,
        subcategories: subcategories,
        allCategories: allCategories
    }
}

// ============================================================================
// Elevator Type Catalog Strategy
// ============================================================================

/**
 * Fetch products for an elevator type directly
 * @param typeHandle - The elevator type slug/handle
 * @returns Products for the type with all products fallback
 */
export async function fetchTypeProducts(typeHandle: string) {
    // TODO: Fetch elevator type from database
    // TODO: Backend needs to support 'type' query param

    // Fetch products for this type
    const { response } = await listProducts({
        queryParams: {
            limit: 100,
            // type: typeHandle  // TODO: Add when backend supports this
        }
    })

    const typeProducts = response.products

    // Get all categories for filter sidebar
    const categories = await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })

    // If no type-specific products, fallback to all products
    let fallbackProducts: typeof response.products = []
    if (typeProducts.length === 0) {
        const { response: fallbackResponse } = await listProducts({
            queryParams: { limit: 100 }
        })
        fallbackProducts = fallbackResponse.products
    }

    return {
        products: typeProducts,
        fallbackProducts: fallbackProducts,
        categories: categories
    }
}

// ============================================================================
// Collection Catalog Strategy
// ============================================================================

/**
 * Fetch products for a collection with related products
 * @param collectionHandle - The collection slug/handle
 * @returns Collection products and related products
 */
export async function fetchCollectionProducts(collectionHandle: string) {
    // TODO: Fetch collection from database
    // TODO: Fetch collection products from product_collections table
    // TODO: Backend needs to support 'collection' query param

    // Fetch products for this collection
    const { response } = await listProducts({
        queryParams: {
            limit: 100,
            // collection: collectionHandle  // TODO: Add when backend supports this
        }
    })

    const collectionProducts = response.products

    // Get all categories for filter sidebar
    const categories = await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })

    // TODO: Fetch related products based on categories or tags
    const relatedProducts: any[] = []

    return {
        products: collectionProducts,
        relatedProducts: relatedProducts,
        categories: categories
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get categories for a specific application
 * This is a placeholder until application_categories mapping is implemented
 */
export async function getCategoriesForApplication(applicationHandle: string) {
    // TODO: Query application_categories mapping table
    // For now, return all categories
    return await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })
}

/**
 * Get products count for each category
 */
export async function getCategoryProductCounts() {
    const categories = await listCategories({
        parent_id: null,
        include_descendants_tree: true
    })

    const { response } = await listProducts({
        queryParams: { limit: 1000 }
    })

    const counts: Record<string, number> = {}

    for (const category of categories) {
        const count = response.products.filter(p =>
            p.categories?.some((c: any) => c.id === category.id)
        ).length
        counts[category.id] = count
    }

    return counts
}

