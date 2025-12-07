import { 
  getCustomerMetaByCustomerId, 
  isBusinessCustomer as checkIsBusinessCustomer,
  isVerifiedCustomer as checkIsVerifiedCustomer,
  type CustomerMeta 
} from "../../lib/db/customer-meta"

/**
 * Get customer metadata from Neon DB
 */
export async function getCustomerMeta(
  customerId: string
): Promise<CustomerMeta | null> {
  return await getCustomerMetaByCustomerId(customerId)
}

/**
 * Get customer account type
 */
export async function getCustomerAccountType(
  customerId: string
): Promise<"individual" | "business" | null> {
  const meta = await getCustomerMetaByCustomerId(customerId)
  return meta?.account_type || null
}

/**
 * Check if customer is a business account
 */
export async function isBusinessCustomer(customerId: string): Promise<boolean> {
  return await checkIsBusinessCustomer(customerId)
}

/**
 * Check if customer is an individual account
 */
export async function isIndividualCustomer(customerId: string): Promise<boolean> {
  const accountType = await getCustomerAccountType(customerId)
  return accountType === "individual" || accountType === null
}

/**
 * Check if customer is verified (for business accounts)
 */
export async function isVerifiedCustomer(customerId: string): Promise<boolean> {
  return await checkIsVerifiedCustomer(customerId)
}

/**
 * Get company name for business customers
 */
export async function getCompanyName(customerId: string): Promise<string | null> {
  const meta = await getCustomerMetaByCustomerId(customerId)
  return meta?.company_name || null
}
