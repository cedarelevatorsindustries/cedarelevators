import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getBusinessCustomers, getVerifiedBusinessCustomers } from "../../../../lib/db/customer-meta"

/**
 * GET /admin/customers/business
 * Get all business customers (admin only)
 * Query params: ?verified=true to get only verified customers
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const verifiedOnly = req.query.verified === "true"

    const customers = verifiedOnly 
      ? await getVerifiedBusinessCustomers()
      : await getBusinessCustomers()

    return res.json({
      success: true,
      data: customers,
      count: customers.length
    })
  } catch (error) {
    console.error("Error fetching business customers:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch business customers"
    })
  }
}
