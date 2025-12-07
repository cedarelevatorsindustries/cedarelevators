import { Metadata } from 'next'
import { Suspense } from 'react'
import { OrderConfirmationTemplate } from '@/modules/checkout'

export const metadata: Metadata = {
  title: 'Order Confirmed | Cedar Elevators',
  description: 'Your order has been placed successfully',
}

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = await params
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <OrderConfirmationTemplate orderId={id} />
    </Suspense>
  )
}
