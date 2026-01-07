import { createClerkSupabaseClient } from '@/lib/supabase/server'
import type { Collection } from '@/lib/types/collections'

/**
 * Get general collections for homepage
 * @param isGuest - Whether user is a guest
 * @param isAuth - Whether user is authenticated
 */
export async function getGeneralCollections(isGuest: boolean = false, isAuth: boolean = false) {
    const supabase = await createClerkSupabaseClient()

    let query = supabase
        .from('collections')
        .select('*')
        .eq('collection_type', 'general')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

    // Filter by guest visibility if user is a guest
    if (isGuest) {
        query = query.eq('show_in_guest', true)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching general collections:', error)
        return []
    }

    return data as Collection[]
}

/**
 * Get business-specific collections
 */
export async function getBusinessCollections() {
    const supabase = await createClerkSupabaseClient()

    const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('collection_type', 'business_specific')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

    if (error) {
        console.error('Error fetching business collections:', error)
        return []
    }

    return data as Collection[]
}

/**
 * Get category-specific collections
 * @param categoryId - Optional category ID to filter by specific category
 */
export async function getCategoryCollections(categoryId?: string) {
    const supabase = await createClerkSupabaseClient()

    let query = supabase
        .from('collections')
        .select('*')
        .eq('collection_type', 'category_specific')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

    // Filter by specific category if provided
    if (categoryId) {
        query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching category collections:', error)
        return []
    }

    return data as Collection[]
}

/**
 * Get collection with its products
 * @param collectionId - Collection ID
 * @param limit - Number of products to return (default: 4 for preview)
 */
export async function getCollectionWithProducts(collectionId: string, limit: number = 4) {
    const supabase = await createClerkSupabaseClient()

    // First get the collection
    const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single()

    if (collectionError) {
        console.error('Error fetching collection:', collectionError)
        return null
    }

    // Then get products assigned to this collection
    const { data: productCollections, error: productsError } = await supabase
        .from('product_collections')
        .select(`
      product_id,
      position,
      products:product_id (
        id,
        title,
        handle,
        thumbnail,
        status,
        variants (
          id,
          prices (
            amount,
            currency_code
          )
        )
      )
    `)
        .eq('collection_id', collectionId)
        .order('position', { ascending: true })
        .limit(limit)

    if (productsError) {
        console.error('Error fetching collection products:', productsError)
        return { ...collection, products: [] }
    }

    // Transform products data
    const products = productCollections?.map((pc: any) => pc.products).filter(Boolean) || []

    return {
        ...collection,
        products,
        product_count: products.length
    }
}

/**
 * Get collection by slug
 */
export async function getCollectionBySlug(slug: string) {
    const supabase = await createClerkSupabaseClient()

    const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (error) {
        console.error('Error fetching collection by slug:', error)
        return null
    }

    return data as Collection
}
