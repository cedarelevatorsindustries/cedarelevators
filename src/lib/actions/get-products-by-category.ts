'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

// =============================================
// HELPER
// =============================================

function ensureSupabase(client: ReturnType<typeof createServerSupabaseClient>) {
    if (!client) {
        throw new Error('Failed to create Supabase client')
    }
    return client
}

// =============================================
// GET PRODUCTS BY CATEGORY
// =============================================

export async function getProductsByCategory(categoryId: string) {
    try {
        const supabase = ensureSupabase(createServerSupabaseClient())

        // First, check if this category has subcategories
        const { data: subcategoryData } = await supabase
            .from('category_subcategories')
            .select('subcategory_id')
            .eq('category_id', categoryId)

        const hasSubcategories = subcategoryData && subcategoryData.length > 0

        if (hasSubcategories) {
            // Parent category: Fetch products grouped by subcategory
            const subcategoryIds = subcategoryData.map(s => s.subcategory_id)

            // Fetch subcategories with their details
            const { data: subcategories, error: subcatError } = await supabase
                .from('subcategories')
                .select('*')
                .in('id', subcategoryIds)
                .order('categories_card_position', { ascending: true, nullsFirst: false })
                .order('title', { ascending: true })

            if (subcatError) throw subcatError

            // Fetch products for each subcategory
            const groupedProducts = await Promise.all(
                (subcategories || []).map(async (subcat) => {
                    // Get product IDs for this subcategory
                    const { data: productCategoryData } = await supabase
                        .from('product_categories')
                        .select('product_id')
                        .eq('category_id', subcat.id)

                    const productIds = productCategoryData?.map(pc => pc.product_id) || []

                    if (productIds.length === 0) {
                        return {
                            subcategory: {
                                id: subcat.id,
                                name: subcat.title,
                                handle: subcat.handle,
                                thumbnail: subcat.thumbnail
                            },
                            products: []
                        }
                    }

                    // Fetch product details
                    const { data: products } = await supabase
                        .from('products')
                        .select('id, title, handle, thumbnail, status, created_at')
                        .in('id', productIds)
                        .order('title', { ascending: true })

                    return {
                        subcategory: {
                            id: subcat.id,
                            name: subcat.title,
                            handle: subcat.handle,
                            thumbnail: subcat.thumbnail
                        },
                        products: products || []
                    }
                })
            )

            return {
                hasSubcategories: true,
                groupedProducts,
                success: true
            }
        } else {
            // Leaf category: Fetch products directly
            const { data: productCategoryData } = await supabase
                .from('product_categories')
                .select('product_id')
                .eq('category_id', categoryId)

            const productIds = productCategoryData?.map(pc => pc.product_id) || []

            if (productIds.length === 0) {
                return {
                    hasSubcategories: false,
                    products: [],
                    success: true
                }
            }

            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, title, handle, thumbnail, status, created_at')
                .in('id', productIds)
                .order('title', { ascending: true })

            if (productsError) throw productsError

            return {
                hasSubcategories: false,
                products: products || [],
                success: true
            }
        }
    } catch (error) {
        console.error('Error fetching products by category:', error)
        return {
            hasSubcategories: false,
            products: [],
            error: 'Failed to fetch products',
            success: false
        }
    }
}
