import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Product } from "@/lib/types/domain"


interface ListProductsParams {
  queryParams?: {
    limit?: number
    offset?: number
    category_id?: string[]
    subcategory_id?: string  // Added for subcategory filtering
    application_id?: string
    elevator_type_id?: string
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

    // If filtering by subcategory, get product IDs from product_subcategories junction table
    if (queryParams?.subcategory_id) {
      console.log('[listProducts] Filtering by subcategory ID:', queryParams.subcategory_id)
      const { data: junctionData } = await supabase
        .from('product_subcategories')
        .select('product_id')
        .eq('subcategory_id', queryParams.subcategory_id)

      console.log('[listProducts] Subcategory junction table returned:', junctionData?.length || 0, 'products')

      if (junctionData && junctionData.length > 0) {
        const subcategoryProductIds = junctionData.map(j => j.product_id)
        // If we already have productIds from category filter, intersect them
        if (productIds !== null) {
          productIds = productIds.filter(id => subcategoryProductIds.includes(id))
        } else {
          productIds = subcategoryProductIds
        }
        console.log('[listProducts] Final product IDs after subcategory filter:', productIds)

        // If no products match both filters, return empty
        if (productIds.length === 0) {
          return {
            response: {
              products: [],
              count: 0,
              offset,
              limit
            }
          }
        }
      } else {
        // No products found for this subcategory
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

    // If filtering by application_id, intersect with product_applications junction table
    if (queryParams?.application_id) {
      const { data: appJunctionData } = await supabase
        .from('product_applications')
        .select('product_id')
        .eq('application_id', queryParams.application_id)

      if (appJunctionData && appJunctionData.length > 0) {
        const appProductIds = appJunctionData.map(j => j.product_id)
        productIds = productIds !== null
          ? productIds.filter(id => appProductIds.includes(id))
          : appProductIds

        if (productIds.length === 0) {
          return { response: { products: [], count: 0, offset, limit } }
        }
      } else {
        return { response: { products: [], count: 0, offset, limit } }
      }
    }

    // If filtering by elevator_type_id, intersect with product_elevator_types junction table
    if (queryParams?.elevator_type_id) {
      const { data: typeJunctionData } = await supabase
        .from('product_elevator_types')
        .select('product_id')
        .eq('elevator_type_id', queryParams.elevator_type_id)

      if (typeJunctionData && typeJunctionData.length > 0) {
        const typeProductIds = typeJunctionData.map(j => j.product_id)
        productIds = productIds !== null
          ? productIds.filter(id => typeProductIds.includes(id))
          : typeProductIds

        if (productIds.length === 0) {
          return { response: { products: [], count: 0, offset, limit } }
        }
      } else {
        return { response: { products: [], count: 0, offset, limit } }
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
      // Intersect with productIds if category/application/elevator_type filters are also active
      const searchedProductIds = searchResults
        .map((p: any) => p.id)
        .filter((id: string) => productIds === null || productIds.includes(id))

      if (searchedProductIds.length === 0) {
        return {
          response: {
            products: [],
            count: 0,
            offset,
            limit
          }
        }
      }

      const { data: fullProducts, error: fullProductsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          sku,
          price,
          compare_at_price,
          stock_quantity,
          track_inventory,
          allow_backorders,
          images,
          thumbnail_url,
          status,
          created_at,
          product_categories(
            category:categories(id, title, slug, handle)
          ),
          product_subcategories(
            subcategory:subcategories(id, title, slug)
          ),
          product_applications(
            application:applications(id, title, handle)
          ),
          product_variants(
            id,
            name,
            sku,
            variant_title,
            options,
            price,
            compare_at_price,
            inventory_quantity
          )
        `)
        .in('id', searchedProductIds)

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
      const orderedProducts = searchedProductIds
        .map((id: string) => productsMap.get(id))
        .filter(Boolean)
        .map((p: any) => {
          const parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
          return {
            ...p,
            stock_quantity: p.stock_quantity || 0, // Ensure product-level stock is included
            title: p.name,
            handle: p.slug,
            images: parsedImages,
            thumbnail: p.thumbnail_url || p.thumbnail || (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0].url : null),
            variants: (p.product_variants || []).map((v: any) => ({
              ...v,
              title: v.name || v.variant_title,
              inventory_quantity: v.inventory_quantity || 0
            })),
            categories: p.product_categories?.map((pc: any) => ({
              ...pc.category,
              name: pc.category?.title || pc.category?.name,
              handle: pc.category?.handle || pc.category?.slug
            })).filter(Boolean) || [],
            subcategories: p.product_subcategories?.map((ps: any) => ps.subcategory).filter(Boolean) || [],
            applications: p.product_applications?.map((pa: any) => pa.application).filter(Boolean) || []
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
      // Fetch explicit catalog/filter columns + taxonomy junctions (avoids PostgREST statement timeout on * lateral joins)
      .select(`
        id,
        name,
        slug,
        description,
        sku,
        price,
        compare_at_price,
        stock_quantity,
        track_inventory,
        allow_backorders,
        images,
        thumbnail_url,
        status,
        created_at,
        product_categories(
          category:categories(id, title, slug, handle)
        ),
        product_subcategories(
          subcategory:subcategories(id, title, slug)
        ),
        product_applications(
          application:applications(id, title, handle)
        ),
        product_variants(
          id,
          name,
          sku,
          variant_title,
          options,
          price,
          compare_at_price,
          inventory_quantity
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
        stock_quantity: p.stock_quantity || 0, // Ensure product-level stock is included
        title: p.name, // Map name to title for compatibility
        handle: p.slug, // Map slug to handle for compatibility
        images: parsedImages,
        thumbnail: p.thumbnail_url || p.thumbnail || (Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0].url : null),
        variants: (p.product_variants || []).map((v: any) => ({
          ...v,
          title: v.name || v.variant_title,
          inventory_quantity: v.inventory_quantity || 0
        })),
        // Extract categories, subcategories, and applications from junction tables
        categories: p.product_categories?.map((pc: any) => ({
          ...pc.category,
          name: pc.category?.title,
          handle: pc.category?.handle || pc.category?.slug
        })).filter(Boolean) || [],
        subcategories: p.product_subcategories?.map((ps: any) => ps.subcategory).filter(Boolean) || [],
        applications: p.product_applications?.map((pa: any) => pa.application).filter(Boolean) || []
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
      variants: (data.product_variants || []).map((v: any) => ({
        ...v,
        title: v.name || v.variant_title,
        inventory_quantity: v.inventory_quantity || 0
      })),
    } as Product
  } catch (error) {
    console.error("Error in getProductByHandle:", error)
    return null
  }
}

