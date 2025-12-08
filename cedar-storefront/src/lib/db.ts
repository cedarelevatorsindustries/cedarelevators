// Database utilities for customer metadata
// This module handles customer metadata storage in Neon DB

type CustomerMeta = {
  customer_id: string
  clerk_user_id: string
  account_type: "individual" | "business"
  company_name: string | null
  tax_id: string | null
  is_verified: boolean
}

export async function upsertCustomerMeta(data: CustomerMeta): Promise<CustomerMeta | null> {
  try {
    // TODO: Implement actual database upsert logic
    // For now, return the data as-is
    console.log("Upserting customer meta:", data)
    return data
  } catch (error) {
    console.error("Error upserting customer meta:", error)
    return null
  }
}

export async function getCustomerMeta(customerId: string): Promise<CustomerMeta | null> {
  try {
    // TODO: Implement actual database query
    console.log("Getting customer meta for:", customerId)
    return null
  } catch (error) {
    console.error("Error getting customer meta:", error)
    return null
  }
}
