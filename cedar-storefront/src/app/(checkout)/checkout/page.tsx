import { Metadata } from 'next'
import { CheckoutTemplate } from '@/modules/checkout'

export const metadata: Metadata = {
  title: 'Checkout | Cedar Elevators',
  description: 'Complete your order for premium elevator components',
}

export default function CheckoutPage() {
  return <CheckoutTemplate />
}
