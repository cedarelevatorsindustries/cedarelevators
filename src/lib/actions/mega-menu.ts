"use server"

import { createClerkSupabaseClient } from "@/lib/supabase/server"

export async function getMegaMenuData() {
    try {
        const supabase = await createClerkSupabaseClient()

        // 1. Fetch active top-level categories
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .is('parent_id', null)
            .eq('is_active', true)
            .order('name', { ascending: true })

        if (catError) throw catError

        // 2. For each category, fetch 5 top products
        const categoriesWithProducts = await Promise.all(
            (categories || []).map(async (category) => {
                // Fetch products for this category
                // We use the same logic as listProducts: assuming category_id column
                // We also want to ensure we get valid products (published/status)
                const { data: products } = await supabase
                    .from('products')
                    .select('id, title, handle, thumbnail, price, description, metadata')
                    .eq('category_id', category.id)
                    .eq('status', 'published')
                    .limit(5)

                return {
                    ...category,
                    products: products || []
                }
            })
        )

        return { success: true, categories: categoriesWithProducts }
    } catch (error) {
        console.error('Error fetching mega menu data:', error)
        return { success: false, categories: [], error }
    }
}
