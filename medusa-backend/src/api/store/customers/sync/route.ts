import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const customerModuleService = req.scope.resolve("customer")
  
  const { email, first_name, last_name, clerk_user_id } = req.body

  if (!email) {
    res.status(400).json({ error: "Email is required" })
    return
  }

  try {
    // Check if customer already exists
    const existingCustomers = await customerModuleService.listCustomers({
      email,
    })

    let customer

    if (existingCustomers.length > 0) {
      // Customer exists, return it
      customer = existingCustomers[0]
    } else {
      // Create new customer
      customer = await customerModuleService.createCustomers({
        email,
        first_name: first_name || "",
        last_name: last_name || "",
        metadata: {
          clerk_user_id: clerk_user_id || null,
        },
      })
    }

    res.status(200).json({
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
    })
  } catch (error: any) {
    console.error("Error syncing customer:", error)
    res.status(500).json({
      error: error.message || "Failed to sync customer",
    })
  }
}
