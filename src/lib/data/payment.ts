
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
  // TODO: Implement Payment Methods in Supabase if needed (e.g. stripe_customers table)
  return { payment_methods: [] }
}
