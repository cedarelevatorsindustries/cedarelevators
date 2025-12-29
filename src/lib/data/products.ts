import { getSupabaseClient } from "@/lib/supabase/client"
import { Product } from "@/lib/types/domain"


interface ListProductsParams {
  queryParams?: {
    limit?: number
    offset?: number
    category_id?: string[]
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
 * Fetch products from Supabase
 */
export async function listProducts(params?: ListProductsParams): Promise<ListProductsResponse> {
  const { queryParams } = params || {}
  const limit = queryParams?.limit || 20
  const offset = queryParams?.offset || 0

  // Fetch from Supabase
  try {
    const supabase = getSupabaseClient()

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)

    if (queryParams?.q) {
      query = query.ilike('title', `%${queryParams.q}%`)
    }

    if (queryParams?.category_id && queryParams.category_id.length > 0) {
      query = query.in('category_id', queryParams.category_id)
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
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
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
 * Fetch a single product by handle from Supabase
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {

  // Fetch from Supabase
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('products')
      .select('*, variants(*)')
      .eq('handle', handle)
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
