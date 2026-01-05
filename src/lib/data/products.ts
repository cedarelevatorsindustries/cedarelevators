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

    let query = supabase
      .from('products')
      // Fetch categories via product_categories junction table
      .select(`
        *,
        product_categories!inner(
          category:categories(*)
        )
      `, { count: 'exact' })
      .eq('status', 'active') // Only fetch active products
      .range(offset, offset + limit - 1)

    if (queryParams?.q) {
      // Search in name field (products table uses 'name' not 'title')
      query = query.ilike('name', `%${queryParams.q}%`)
    }

    if (queryParams?.category_id && queryParams.category_id.length > 0) {
      // Filter by category via junction table
      query = query.in('product_categories.category.id', queryParams.category_id)
    }

    if (queryParams?.application_id) {
      // Filter by application_id if products table has this column
      query = query.eq('application_id', queryParams.application_id)
    }

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

    const products: Product[] = (data || []).map((p: any) => ({
      ...p,
      title: p.name, // Map name to title for compatibility
      handle: p.slug, // Map slug to handle for compatibility
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
      // Extract categories from junction table
      categories: p.product_categories?.map((pc: any) => ({
        ...pc.category,
        name: pc.category?.title,
        handle: pc.category?.handle || pc.category?.slug
      })).filter(Boolean) || []
    }))

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

    return {
      ...data,
      images: typeof data.images === 'string' ? JSON.parse(data.images) : data.images
    } as Product
  } catch (error) {
    console.error("Error in getProductByHandle:", error)
    return null
  }
}

