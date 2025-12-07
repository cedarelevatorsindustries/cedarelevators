import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { QuoteStatus } from "../../modules/quote/models/quote"

type ValidateQuoteCanAcceptInput = {
  quote: {
    id: string
    status: QuoteStatus
  }
}

export const validateQuoteCanAcceptStep = createStep(
  "validate-quote-can-accept",
  async (input: ValidateQuoteCanAcceptInput) => {
    if (input.quote.status !== QuoteStatus.PENDING_CUSTOMER) {
      throw new Error("Quote must be pending customer review to be accepted")
    }

    return new StepResponse(void 0)
  }
)
