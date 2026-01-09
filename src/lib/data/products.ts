import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Product } from "@/lib/types/domain"


interface ListProductsParams {
  queryParams?: {
    limit?: number
    offset?: number
    category_id?: string[]
    application_id?: string
    q?: string
  }
}

interface ListProductsResponse {
  response: {
    products: Product[]
    count: number
    offset: number
    limit: number
  }
}

/**
 * Fetch products from Supabase (Server-side)
 */
export async function listProducts(params?: ListProductsParams): Promise<ListProductsResponse> {
  const { queryParams } = params || {}
  const limit = queryParams?.limit || 20
  const offset = queryParams?.offset || 0

  // Fetch from Supabase using server client
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      console.error("Failed to create Supabase client")
      return {
        response: {
          products: [],
          count: 0,
          offset,
          limit
        }
      }
    }

    // If filtering by categories, first get product IDs from junction table
    let productIds: string[] | null = null
    if (queryParams?.category_id && queryParams.category_id.length > 0) {
      console.log('[listProducts] Filtering by category IDs:', queryParams.category_id)
      const { data: junctionData } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', queryParams.category_id)

      console.log('[listProducts] Junction table returned:', junctionData?.length || 0, 'products')

      if (junctionData && junctionData.length > 0) {
        productIds = junctionData.map(j => j.product_id)
        console.log('[listProducts] Product IDs:', productIds)
      } else {
        // No products found for these categories
        return {
          response: {
            products: [],
            count: 0,
            offset,
            limit
          }
        }
      }
    }

    let query = supabase
      .from('products')
      // Fetch categories via product_categories junction table
      .select(`
        *,
        product_categories(
          category:categories(*)
        )
      `, { count: 'exact' })
      .eq('status', 'active') // Only fetch active products

    // Apply category filter if we have product IDs
    if (productIds !== null) {
      query = query.in('id', productIds)
    }

    if (queryParams?.q) {
      // Search in name field (products table uses 'name' not 'title')
      query = query.ilike('name', `%${queryParams.q}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching products from Supabase:", error)
      return {
        response: {
          products: [],
          count: 0,
          offset,
          limit
        }
      }
    }

    const products: Product[] = (data || []).map((p: any) => {
      const parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images

      return {
        ...p,
        title: p.name, // Map name to title for compatibility
        handle: p.slug, // Map slug to handle for compatibility
        images: parsedImages,
        thumbnail: p.thumbnail || (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0].url : null),
        // Extract categories from junctiontable
        categories: p.product_categories?.map((pc: any) => ({
          ...pc.category,
          name: pc.category?.title,
          handle: pc.category?.handle || pc.category?.slug
        })).filter(Boolean) || []
      }
    })

    return {
      response: {
        products,
        count: count || 0,
        offset,
        limit
      }
    }
  } catch (error) {
    console.error("Error in listProducts:", error)
    return {
      response: {
        products: [],
        count: 0,
        offset,
        limit
      }
    }
  }
}

/**
 * Fetch a single product by handle from Supabase (Server-side)
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {

  // Fetch from Supabase using server client
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      console.error("Failed to create Supabase client")
      return null
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('slug', handle)  // Products table uses 'slug', not 'handle'
      .single()

    if (error || !data) {
      console.error("Error fetching product by handle:", error)
      return null
    }

    const parsedImages = typeof data.images === 'string' ? JSON.parse(data.images) : data.images

    return {
      ...data,
      title: data.name, // Map name to title
      handle: data.slug, // Map slug to handle
      images: parsedImages,
      thumbnail: data.thumbnail || (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0].url : null),
      variants: data.product_variants || [], // Include variants with prices
    } as Product
  } catch (error) {
    console.error("Error in getProductByHandle:", error)
    return null
  }
}

