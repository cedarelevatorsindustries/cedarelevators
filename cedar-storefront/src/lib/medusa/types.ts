export interface CustomerMeta {
  id: string
  customer_id: string
  clerk_user_id: string | null
  account_type: "individual" | "business"
  company_name: string | null
  tax_id: string | null
  is_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface SyncRolePayload {
  clerk_user_id: string
  account_type: "individual" | "business"
  company_name?: string
  tax_id?: string
  email: string
  first_name?: string
  last_name?: string
}
