import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateCustomerVerification } from "../../../../lib/db/customer-meta"

/**
 * POST /admin/customers/verify
 * Verify a business customer (admin only)
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { customerId, isVerified } = req.body as { customerId: string; isVerified: boolean }

    if (!customerId || typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "customerId and isVerified (boolean) are required"
      })
    }

    const success = await updateCustomerVerification(customerId, isVerified)

    if (!success) {
      return res.status(500).json({
        success: false,
        message: "Failed to update customer verification status"
      })
    }

    return res.json({
      success: true,
      message: `Customer ${customerId} verification status updated to ${isVerified}`
    })
  } catch (error) {
    console.error("Error verifying customer:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify customer"
    })
  }
}
