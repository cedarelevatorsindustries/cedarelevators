import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"
import { QuoteStatus } from "../../modules/quote/models/quote"

type UpdateQuotesStepInput = {
  id: string
  status: QuoteStatus
}[]

export const updateQuotesStep = createStep(
  "update-quotes",
  async (input: UpdateQuotesStepInput, { container }) => {
    const quoteModuleService: QuoteModuleService = container.resolve(QUOTE_MODULE)

    const originalQuotes = await quoteModuleService.listQuotes({
      id: input.map((quote) => quote.id),
    })

    const updatedQuotes = await quoteModuleService.updateQuotes(input)

    return new StepResponse(updatedQuotes, originalQuotes)
  },
  async (originalQuotes, { container }) => {
    if (!originalQuotes) {
      return
    }

    const quoteModuleService: QuoteModuleService = container.resolve(QUOTE_MODULE)

    await quoteModuleService.updateQuotes(
      originalQuotes.map((quote) => ({
        id: quote.id,
        status: quote.status,
      }))
    )
  }
)
