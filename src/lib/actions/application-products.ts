"use server"

import { createServerSupabase } from "@/lib/supabase/server"

/**
 * Get all products from categories linked to an application, grouped by category
 */
export async function getApplicationProducts(applicationId: string) {
    try {
        // Validate applicationId
        if (!applicationId || applicationId.trim() === '') {
            return {
                success: true,
                groupedProducts: [],
                totalProducts: 0
            }
        }

        const supabase = await createServerSupabase()

        // First, get all categories linked to this application
        const { data: categoryLinks, error: categoryError } = await supabase
            .from('application_categories')
            .select(`
                category_id,
                category:categories!category_id (
                    id,
                    title,
                    slug,
                    thumbnail
                )
            `)
            .eq('application_id', applicationId)
            .order('sort_order', { ascending: true })

        if (categoryError) throw categoryError

        if (!categoryLinks || categoryLinks.length === 0) {
            return {
                success: true,
                groupedProducts: [],
                totalProducts: 0
            }
        }

        // For each category, get its products
        const groupedProducts = await Promise.all(
            categoryLinks.map(async (link: any) => {
                const { data: products, error: productsError } = await supabase
                    .from('product_categories')
                    .select(`
                        product:products!product_id (
                            id,
                            name,
                            slug,
                            thumbnail_url,
                            status
                        )
                    `)
                    .eq('category_id', link.category_id)

                if (productsError) {
                    console.error('Error fetching products for category:', productsError)
                    return {
                        category: link.category,
                        products: []
                    }
                }

                const validProducts = products
                    ?.map((item: any) => item.product)
                    .filter((product: any) => product !== null) || []

                return {
                    category: link.category,
                    products: validProducts
                }
            })
        )

        const totalProducts = groupedProducts.reduce((sum, group) => sum + group.products.length, 0)

        return {
            success: true,
            groupedProducts,
            totalProducts
        }
    } catch (error) {
        console.error('Error fetching application products:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch products',
            groupedProducts: [],
            totalProducts: 0
        }
    }
}
