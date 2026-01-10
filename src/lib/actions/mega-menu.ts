"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getMegaMenuData() {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            console.error('MegaMenu: Failed to create Supabase client')
            return { success: false, categories: [], error: 'Failed to create client' }
        }

        // 1. Fetch active categories from the categories table
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('title', { ascending: true })

        console.log('[getMegaMenuData] Categories query:', {
            count: categories?.length || 0,
            error: catError?.message,
            categories: categories?.map(c => ({ id: c.id, title: c.title, slug: c.slug }))
        })

        if (catError) {
            console.error('[getMegaMenuData] Category fetch error:', catError)
            throw catError
        }

        // 2. For each category, fetch its products (limit 5 per category)
        const categoriesWithProducts = await Promise.all(
            (categories || []).map(async (category) => {
                // Fetch products for this category via junction table
                const { data: productLinks } = await supabase
                    .from('product_categories')
                    .select(`
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
                    .eq('category_id', category.id)
                    .limit(5)

                // Extract and filter active products
                const products = (productLinks || [])
                    .map(link => link.product)
                    .filter((p: any) => p && p.status === 'active')

                return {
                    id: category.id,
                    name: category.title, // Map 'title' to 'name' for display
                    handle: category.slug,
                    description: category.description,
                    metadata: {
                        image: category.image_url
                    },
                    products: (products || []).map((p: any) => ({
                        id: p.id,
                        title: p.name, // Map 'name' to 'title'
                        handle: p.slug, // Map 'slug' to 'handle'
                        thumbnail: p.thumbnail_url,
                        price: {
                            amount: p.price || 0,
                            currency_code: 'INR'
                        },
                        description: p.short_description || p.description, // Use short_description if available
                        sku: p.sku
                    }))
                }
            })
        )

        // Filter out categories with no products
        const categoriesWithProductsFiltered = categoriesWithProducts.filter(
            cat => cat.products && cat.products.length > 0
        )

        return { success: true, categories: categoriesWithProductsFiltered }
    } catch (error) {
        console.error('Error fetching mega menu data:', error)
        return { success: false, categories: [], error }
    }
}

