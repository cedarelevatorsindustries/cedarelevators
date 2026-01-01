"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getMegaMenuData() {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            console.error('MegaMenu: Failed to create Supabase client')
            return { success: false, categories: [], error: 'Failed to create client' }
        }

        // 1. Fetch active applications
        const { data: applications, error: appError } = await supabase
            .from('applications')
            .select('*')
            .eq('status', 'active')
            .order('title', { ascending: true })

        if (appError) throw appError

        // 2. For each application, fetch its categories with products
        const applicationsWithProducts = await Promise.all(
            (applications || []).map(async (application) => {
                // Get category IDs for this application
                const { data: appCategories } = await supabase
                    .from('application_categories')
                    .select('category_id')
                    .eq('application_id', application.id)
                    .order('sort_order', { ascending: true })

                const categoryIds = (appCategories || []).map(ac => ac.category_id)

                if (categoryIds.length === 0) {
                    return {
                        ...application,
                        products: []
                    }
                }

                // Fetch products from these categories (and their subcategories)
                const { data: products } = await supabase
                    .from('products')
                    .select('id, name, slug, thumbnail, price, short_description, sku')
                    .in('category_id', categoryIds)
                    .eq('status', 'active')
                    .limit(5)

                return {
                    ...application,
                    products: products || []
                }
            })
        )

        return { success: true, categories: applicationsWithProducts }
    } catch (error) {
        console.error('Error fetching mega menu data:', error)
        return { success: false, categories: [], error }
    }
}
