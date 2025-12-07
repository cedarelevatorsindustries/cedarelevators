import { z } from "zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const CreateQuote = z.object({
  cart_id: z.string(),
})

export type CreateQuoteType = z.infer<typeof CreateQuote>

export const GetQuoteParams = createFindParams()
