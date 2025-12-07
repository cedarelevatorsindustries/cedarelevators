import { HttpTypes } from "@medusajs/types"

/**
 * Fetch categories from Medusa backend
 * TODO: Replace with actual Medusa API endpoint
 */
export async function listCategories(): Promise<HttpTypes.StoreProductCategory[]> {
  try {
    // TODO: Replace with your actual Medusa backend URL
    // const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/product-categories`)
    // const data = await response.json()
    // return data.product_categories
    
    // Mock data for now
    return []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}
