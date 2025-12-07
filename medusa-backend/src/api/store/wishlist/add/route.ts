import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { variant_id, product_id, title, thumbnail, price } = req.body

  const wishlistService = req.scope.resolve("wishlistService")
  
  const customerId = req.auth?.actor_id
  const sessionId = req.session?.id

  const wishlist = await wishlistService.addItem(
    variant_id,
    product_id,
    title,
    thumbnail,
    price,
    customerId,
    sessionId
  )

  const items = await wishlistService.list(customerId, sessionId)

  res.json({ 
    wishlist,
    items,
    count: items.length 
  })
}
