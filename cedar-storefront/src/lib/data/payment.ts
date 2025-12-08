import { sdk } from "@/lib/config/medusa-client"

export type SavedPaymentMethod = {
  id: string
  provider_id: string
  data: {
    card?: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
      network?: string
    }
    bank?: string
    wallet?: string
    type: string
  }
}

export type SavedPaymentMethodsResponse = {
  payment_methods: SavedPaymentMethod[]
}

export async function getSavedPaymentMethods(
  accountHolderId: string
): Promise<SavedPaymentMethodsResponse> {
  return sdk.client
    .fetch<SavedPaymentMethodsResponse>(
      `/store/payment-methods/${accountHolderId}`,
      {
        method: "GET",
        credentials: "include",
      }
    )
    .then((res: SavedPaymentMethodsResponse) => res)
    .catch((error: unknown) => {
      console.error("Error fetching saved payment methods:", error)
      return { payment_methods: [] }
    })
}
