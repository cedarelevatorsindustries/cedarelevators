import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { QuoteStatus } from "../../modules/quote/models/quote"

type ValidateQuoteNotAcceptedInput = {
  quote: {
    id: string
    status: QuoteStatus
  }
}

export const validateQuoteNotAccepted = createStep(
  "validate-quote-not-accepted",
  async (input: ValidateQuoteNotAcceptedInput) => {
    if (input.quote.status === QuoteStatus.ACCEPTED) {
      throw new Error("Cannot perform this action on an accepted quote")
    }

    return new StepResponse(void 0)
  }
)
