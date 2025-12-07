import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCustomerMetaByCustomerId } from "../../../../lib/db/customer-meta"

/**
 * GET /store/customers/sync-role/:customerId
 * Retrieve customer account type from Neon DB
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const customerId = req.params.customerId

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId is required"
      })
    }

    const customerMeta = await getCustomerMetaByCustomerId(customerId)

    if (!customerMeta) {
      return res.status(404).json({
        success: false,
        message: "Customer metadata not found"
      })
    }

    return res.json({
      success: true,
      data: {
        customer_id: customerMeta.customer_id,
        account_type: customerMeta.account_type,
        company_name: customerMeta.company_name,
        is_verified: customerMeta.is_verified,
      }
    })
  } catch (error) {
    console.error("Error fetching customer role:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customer role"
    })
  }
}
