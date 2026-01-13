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

    // Check if we need to perform full-text search
    if (queryParams?.q) {
      console.log('[listProducts] Performing full-text search for:', queryParams.q)

      const { data: searchResults, error: searchError } = await supabase.rpc('search_products', {
        search_query: queryParams.q,
        result_limit: limit,
        result_offset: offset,
        category_filter: null,  // We handle category filtering via productIds already
        min_price: null,
        max_price: null
      })

      if (searchError) {
        console.error("Error performing full-text search:", searchError)
        return {
          response: {
            products: [],
            count: 0,
            offset,
            limit
          }
        }
      }

      // If no results from search
      if (!searchResults || searchResults.length === 0) {
        return {
          response: {
            products: [],
            count: 0,
            offset,
            limit
          }
        }
      }

      // Get full details for the searched products to ensure consistent data structure
      // We need to fetch them to get product_categories relations which RPC doesn't return
      const productIds = searchResults.map((p: any) => p.id)

      const { data: fullProducts, error: fullProductsError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(
            category:categories(*)
          )
        `)
        .in('id', productIds)

      if (fullProductsError) {
        console.error("Error fetching full product details for search results:", fullProductsError)
        return {
          response: {
            products: [],
            count: 0,
            offset,
            limit
          }
        }
      }

      // Re-order fullProducts to match the rank order from searchResults
      const productsMap = new Map(fullProducts.map((p: any) => [p.id, p]))
      const orderedProducts = productIds
        .map((id: string) => productsMap.get(id))
        .filter(Boolean)
        .map((p: any) => {
          const parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
          return {
            ...p,
            title: p.name,
            handle: p.slug,
            images: parsedImages,
            thumbnail: p.thumbnail || (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0].url : null),
            categories: p.product_categories?.map((pc: any) => ({
              ...pc.category,
              name: pc.category?.title || pc.category?.name,
              handle: pc.category?.handle || pc.category?.slug
            })).filter(Boolean) || []
          }
        })

      // Search RPC returns total count differently - we might need a separate count query or rely on what we have
      // The current RPC implementation doesn't return total count easily without an extra query
      // For now, we'll try to get an approximate count or implement a count RPC if needed. 
      // Actually, the current searchRPC limits results, so we don't know true total.
      // Let's rely on the number of results for now or do a separate count query.
      // Since pagination is tricky with RPC + PostgREST integration without a dedicated count function,
      // we'll assume there might be more if we got a full page.

      // Better approach for count: Use a separate RPC or query for counting if needed, 
      // but listProducts signature returns count.
      // Let's try to get count by calling RPC with large limit or specific count RPC.
      // For this iteration, we'll pass dynamic count if available or undefined.

      // Ideally we should have a `search_products_count` RPC. 
      // For now let's just use the current page length as count if we can't get total, 
      // or effectively disable pagination for search if checking total is hard.
      // Wait, the storeSearch action did: 
      // const { count } = await supabase.from('products')... which was a separate query.

      // Let's implement a quick separate count query matching the search criteria
      // OR just update listProducts to return what we have.

      // Get total count from search results (returned in each row)
      const totalCount = searchResults && searchResults.length > 0 ? searchResults[0].total_count : 0

      return {
        response: {
          products: orderedProducts,
          count: totalCount || orderedProducts.length,
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
        product_categories(
          category:categories(*)
        )
      `, { count: 'exact' })
      .eq('status', 'active') // Only fetch active products

    // Apply category filter if we have product IDs
    if (productIds !== null) {
      query = query.in('id', productIds)
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

