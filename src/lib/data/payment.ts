
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

/**
 * Get saved payment methods for a user
 * Currently returns empty as Razorpay handles this client-side
 * Can be extended to store payment method tokens in Supabase
 */
export async function getSavedPaymentMethods(
  accountHolderId: string
): Promise<SavedPaymentMethodsResponse> {
  // For B2B, we mainly use:
  // 1. Credit terms (30-day) - stored as order payment_method
  // 2. PO Upload - file stored in storage, reference in order
  // 3. Bank Transfer - no saved method needed
  // 4. Razorpay - handles its own saved cards

  // If needed, implement saved payment tokens:
  // const supabase = await createClerkSupabaseClient()
  // const { data } = await supabase
  //   .from('saved_payment_methods')
  //   .select('*')
  //   .eq('user_id', accountHolderId)

  return { payment_methods: [] }
}

/**
 * Store the selected payment method for an order
 */
export interface PaymentMethodSelection {
  type: 'credit_30_day' | 'po_upload' | 'razorpay' | 'bank_transfer'
  razorpay_payment_id?: string
  po_file_url?: string
  reference_number?: string
}

/**
 * Validate payment method selection before order placement
 */
export function validatePaymentMethod(
  selection: PaymentMethodSelection,
  isVerifiedDealer: boolean
): { valid: boolean; error?: string } {
  // Credit terms require verified dealer
  if (selection.type === 'credit_30_day' && !isVerifiedDealer) {
    return { valid: false, error: '30-day credit requires dealer verification' }
  }

  // PO upload requires file
  if (selection.type === 'po_upload' && !selection.po_file_url) {
    return { valid: false, error: 'Please upload a purchase order document' }
  }

  // Razorpay requires payment confirmation
  if (selection.type === 'razorpay' && !selection.razorpay_payment_id) {
    return { valid: false, error: 'Please complete the online payment' }
  }

  return { valid: true }
}


