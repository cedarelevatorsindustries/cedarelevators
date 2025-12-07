/**
 * Customer metadata stored in Neon database
 */
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
 * Account type enum
 */
export type AccountType = "individual" | "business"

/**
 * Customer role check result
 */
export interface CustomerRoleCheck {
  isIndividual: boolean
  isBusiness: boolean
  isVerified: boolean
  companyName: string | null
}
