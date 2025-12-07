import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const wishlistService = req.scope.resolve("wishlistService")
  
  const customerId = req.auth?.actor_id
  const sessionId = req.session?.id

  const items = await wishlistService.list(customerId, sessionId)
  const count = items.length

  res.json({ items, count })
}
