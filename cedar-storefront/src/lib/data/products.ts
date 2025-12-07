import { HttpTypes } from "@medusajs/types"

interface ListProductsParams {
  queryParams?: {
    limit?: number
    offset?: number
    category_id?: string[]
  }
}

interface ListProductsResponse {
  response: {
    products: HttpTypes.StoreProduct[]
    count: number
    offset: number
    limit: number
  }
}

/**
 * Fetch products from Medusa backend
 * TODO: Replace with actual Medusa API endpoint
 */
export async function listProducts(params?: ListProductsParams): Promise<ListProductsResponse> {
  try {
    const { queryParams } = params || {}
    
    // TODO: Replace with your actual Medusa backend URL
    // const searchParams = new URLSearchParams()
    // if (queryParams?.limit) searchParams.set('limit', queryParams.limit.toString())
    // if (queryParams?.offset) searchParams.set('offset', queryParams.offset.toString())
    // if (queryParams?.category_id) queryParams.category_id.forEach(id => searchParams.append('category_id[]', id))
    
    // const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products?${searchParams}`)
    // const data = await response.json()
    
    // Mock data for now
    return {
      response: {
        products: [],
        count: 0,
        offset: 0,
        limit: queryParams?.limit || 20
      }
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      response: {
        products: [],
        count: 0,
        offset: 0,
        limit: 20
      }
    }
  }
}

/**
 * Fetch a single product by handle from Medusa backend
 * TODO: Replace with actual Medusa API endpoint
 */
export async function getProductByHandle(handle: string): Promise<HttpTypes.StoreProduct | null> {
  try {
    // TODO: Replace with your actual Medusa backend URL
    // const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products/${handle}`)
    // if (!response.ok) return null
    // const data = await response.json()
    // return data.product
    
    // Mock data for now - return null to trigger not found
    return null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}
