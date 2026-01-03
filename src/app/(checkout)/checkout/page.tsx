import { Metadata } from 'next'
import { CheckoutGuard } from '@/components/checkout/checkout-guard'
import { CheckoutPageContent } from '@/modules/checkout/components/checkout-page-content'

export const metadata: Metadata = {
  title: 'Checkout | Cedar Elevators',
  description: 'Complete your order for premium elevator components',
}

export default function CheckoutPage() {
  return (
    <CheckoutGuard>
      <CheckoutPageContent />
    </CheckoutGuard>
  )
}
