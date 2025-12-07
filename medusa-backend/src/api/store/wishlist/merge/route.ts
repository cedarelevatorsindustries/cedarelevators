import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { session_id } = req.body

  const wishlistService = req.scope.resolve("wishlistService")
  
  const customerId = req.auth?.actor_id

  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  await wishlistService.merge(session_id, customerId)

  const items = await wishlistService.list(customerId)

  res.json({ 
    items,
    count: items.length,
    message: "Wishlist merged successfully"
  })
}
