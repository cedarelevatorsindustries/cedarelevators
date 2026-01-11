"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * Optimized Mega Menu Data Fetcher
 * Uses batch queries instead of N+1 pattern
 * - Query 1: Fetch all active categories
 * - Query 2: Fetch all products for all categories in one query
 * - Group products by category in JS
 */
export async function getMegaMenuData() {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            console.error('MegaMenu: Failed to create Supabase client')
            return { success: false, categories: [], error: 'Failed to create client' }
        }

        // Query 1: Fetch active categories
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('id, title, slug, description, image_url')
            .eq('is_active', true)
            .order('title', { ascending: true })

        if (catError) {
            console.error('[getMegaMenuData] Category fetch error:', catError)
            throw catError
        }

        if (!categories || categories.length === 0) {
            return { success: true, categories: [] }
        }

        // Query 2: Fetch ALL products for ALL categories in ONE query (optimized)
        const categoryIds = categories.map(c => c.id)
        const { data: allProductLinks, error: productsError } = await supabase
            .from('product_categories')
            .select(`
                category_id,
                product:products (
                    id,
                    name,
                    slug,
                    thumbnail_url,
                    price,
                    short_description,
                    description,
                    sku,
                    status
                )
            `)
            .in('category_id', categoryIds)

        if (productsError) {
            console.error('[getMegaMenuData] Products fetch error:', productsError)
            throw productsError
        }

        // Group products by category_id and limit to 5 per category
        const productsByCategory = new Map<string, any[]>()

        for (const link of allProductLinks || []) {
            const product = link.product as any
            if (!product || product.status !== 'active') continue

            const categoryId = link.category_id
            if (!productsByCategory.has(categoryId)) {
                productsByCategory.set(categoryId, [])
            }

            const categoryProducts = productsByCategory.get(categoryId)!
            if (categoryProducts.length < 5) { // Limit 5 per category
                categoryProducts.push(product)
            }
        }

        // Build final response
        const categoriesWithProducts = categories
            .map(category => {
                const products = productsByCategory.get(category.id) || []

                return {
                    id: category.id,
                    name: category.title,
                    handle: category.slug,
                    description: category.description,
                    metadata: {
                        image: category.image_url
                    },
                    products: products.map((p: any) => ({
                        id: p.id,
                        title: p.name,
                        handle: p.slug,
                        thumbnail: p.thumbnail_url,
                        price: {
                            amount: p.price || 0,
                            currency_code: 'INR'
                        },
                        description: p.short_description || p.description,
                        sku: p.sku
                    }))
                }
            })
            .filter(cat => cat.products.length > 0) // Only categories with products

        console.log('[getMegaMenuData] Optimized query:', {
            totalCategories: categories.length,
            categoriesWithProducts: categoriesWithProducts.length,
            totalProducts: allProductLinks?.length || 0
        })

        return { success: true, categories: categoriesWithProducts }
    } catch (error) {
        console.error('Error fetching mega menu data:', error)
        return { success: false, categories: [], error }
    }
}

