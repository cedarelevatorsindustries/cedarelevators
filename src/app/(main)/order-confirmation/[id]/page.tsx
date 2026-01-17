'use client'

import { use, useState, useEffect, Suspense } from 'react'
import { Metadata } from 'next'
import { getOrder } from '@/lib/actions/orders'
import { Loader2, Package, Truck, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SuccessAnimation from '@/modules/checkout/components/success-animation'
import ConfirmationTemplate from '@/modules/checkout/components/confirmation-template'

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>
}

function OrderConfirmationContent({ params }: OrderConfirmationPageProps) {
  const { id } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrder() {
      try {
        const result = await getOrder(id)

        if (!result.success || !result.order) {
          setError(result.error || 'Order not found')
          return
        }
        setOrder(result.order)
      } catch (err: any) {
        console.error('Load order error:', err)
        setError(err.message || 'Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'We couldn\'t find your order.'}</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Determine payment method text
  const isCOD = order.payment_method?.toLowerCase().includes('cod') ||
    order.payment_method?.toLowerCase().includes('cash on delivery')

  return (
    <SuccessAnimation>
      <ConfirmationTemplate
        type="order"
        id={order.order_number}
        title="Order Placed Successfully!"
        subtitle="Thank you for choosing us. We've received your order and we're getting it ready for delivery."
        summaryDetails={[
          {
            label: 'Order Number',
            value: order.order_number,
            icon: <Package className="w-4 h-4" />,
          },
          {
            label: 'Total Amount',
            value: `₹${(order.total_amount || 0).toLocaleString('en-IN')}`,
            icon: <DollarSign className="w-4 h-4" />,
          },
          {
            label: 'Estimated Delivery',
            value: 'September 18, 2023',
            icon: <Calendar className="w-4 h-4" />,
          },
        ]}
        steps={[
          {
            number: 1,
            title: 'Order Confirmation Email',
            description: "We've sent a detailed receipt and order summary to your registered email address.",
          },
          {
            number: 2,
            title: isCOD ? 'Processing COD Order' : 'Processing Your Order',
            description: isCOD
              ? 'Our team is verifying your delivery address. Since this is a Cash on Delivery order, please ensure you have the exact amount ready upon arrival.'
              : 'Our team is verifying your order and preparing it for shipment.',
          },
          {
            number: 3,
            title: 'Shipped & Tracked',
            description: "Once your package leaves the warehouse, we'll notify you with a tracking number via SMS and email.",
          },
        ]}
        actions={[
          {
            label: 'Track Order',
            href: `/profile/orders`,
            variant: 'default',
            icon: <Truck className="w-4 h-4" />,
          },
          {
            label: 'Continue Shopping',
            href: '/catalog',
            variant: 'outline',
          },
        ]}
        helpLink="/contact"
      />
    </SuccessAnimation>
  )
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
        </div>
      }
    >
      <OrderConfirmationContent params={params} />
    </Suspense>
  )
}
