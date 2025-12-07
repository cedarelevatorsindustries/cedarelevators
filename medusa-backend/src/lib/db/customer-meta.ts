import { sql } from "./index"

export interface CustomerMeta {
  id: number
  customer_id: string
  clerk_user_id: string
  account_type: "individual" | "business"
  company_name: string | null
  tax_id: string | null
  is_verified: boolean
  created_at: Date
  updated_at: Date
}

/**
 * Get customer metadata by Clerk user ID
 */
export async function getCustomerMetaByClerkId(
  clerkUserId: string
): Promise<CustomerMeta | null> {
  try {
    const result = await sql`
      SELECT * FROM customer_meta 
      WHERE clerk_user_id = ${clerkUserId}
      LIMIT 1
    `
    return result[0] as CustomerMeta || null
  } catch (error) {
    console.error("Error fetching customer meta:", error)
    return null
  }
}

/**
 * Get customer metadata by Medusa customer ID
 */
export async function getCustomerMetaByCustomerId(
  customerId: string
): Promise<CustomerMeta | null> {
  try {
    const result = await sql`
      SELECT * FROM customer_meta 
      WHERE customer_id = ${customerId}
      LIMIT 1
    `
    return result[0] as CustomerMeta || null
  } catch (error) {
    console.error("Error fetching customer meta:", error)
    return null
  }
}

/**
 * Get all business customers
 */
export async function getBusinessCustomers(): Promise<CustomerMeta[]> {
  try {
    const result = await sql`
      SELECT * FROM customer_meta 
      WHERE account_type = 'business'
      ORDER BY created_at DESC
    `
    return result as CustomerMeta[]
  } catch (error) {
    console.error("Error fetching business customers:", error)
    return []
  }
}

/**
 * Get all verified business customers
 */
export async function getVerifiedBusinessCustomers(): Promise<CustomerMeta[]> {
  try {
    const result = await sql`
      SELECT * FROM customer_meta 
      WHERE account_type = 'business' AND is_verified = true
      ORDER BY created_at DESC
    `
    return result as CustomerMeta[]
  } catch (error) {
    console.error("Error fetching verified business customers:", error)
    return []
  }
}

/**
 * Update customer verification status
 */
export async function updateCustomerVerification(
  customerId: string,
  isVerified: boolean
): Promise<boolean> {
  try {
    await sql`
      UPDATE customer_meta 
      SET is_verified = ${isVerified}, updated_at = NOW()
      WHERE customer_id = ${customerId}
    `
    return true
  } catch (error) {
    console.error("Error updating customer verification:", error)
    return false
  }
}

/**
 * Check if customer is a business account
 */
export async function isBusinessCustomer(customerId: string): Promise<boolean> {
  const meta = await getCustomerMetaByCustomerId(customerId)
  return meta?.account_type === "business"
}

/**
 * Check if customer is verified
 */
export async function isVerifiedCustomer(customerId: string): Promise<boolean> {
  const meta = await getCustomerMetaByCustomerId(customerId)
  return meta?.is_verified || false
}
