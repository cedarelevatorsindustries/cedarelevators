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
            .order('sort_order', { ascending: true })

        if (catError) throw catError

        // 2. For each category, fetch its products (limit 5 per category)
        const categoriesWithProducts = await Promise.all(
            (categories || []).map(async (category) => {
                // Fetch products for this category
                const { data: products } = await supabase
                    .from('products')
                    .select('id, name, slug, thumbnail_url, price, short_description, description, sku')
                    .eq('category_id', category.id)
                    .eq('status', 'active')
                    .limit(5)

                return {
                    id: category.id,
                    name: category.name,
                    handle: category.slug,
                    description: category.description,
                    metadata: {
                        image: category.image_url
                    },
                    products: (products || []).map(p => ({
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

