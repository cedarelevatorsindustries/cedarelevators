"use server"

import { sdk } from "@/lib/config/medusa-client"
import type { HttpTypes } from "@medusajs/types"

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data?: {
    provider_id?: string
    payment_method_id?: string
    save_payment_method?: boolean
  }
) {
  const paymentCollectionId = cart.payment_collection?.id

  if (!paymentCollectionId) {
    throw new Error("Payment collection not found")
  }

  // Prepare the data object for Razorpay
  const sessionData: Record<string, any> = {}

  // If using a saved payment method
  if (data?.payment_method_id) {
    sessionData.payment_method_id = data.payment_method_id
  }

  // If saving payment method for future use
  if (data?.save_payment_method !== false) {
    // For Razorpay, we need to enable saving the payment method
    sessionData.save = "1"
  }

  return sdk.store.payment.initiatePaymentSession(paymentCollectionId, {
    provider_id: data?.provider_id || "razorpay",
    data: sessionData,
  })
}

export async function setPaymentSession(
  cart: HttpTypes.StoreCart,
  providerId: string
) {
  const paymentCollectionId = cart.payment_collection?.id

  if (!paymentCollectionId) {
    throw new Error("Payment collection not found")
  }

  return sdk.store.payment.updatePaymentCollection(paymentCollectionId, {
    provider_id: providerId,
  })
}

export async function completeCart(cartId: string) {
  return sdk.store.cart.complete(cartId)
}
