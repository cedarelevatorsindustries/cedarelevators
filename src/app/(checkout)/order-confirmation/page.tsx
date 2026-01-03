/**
 * Order Confirmation Page
 * Displays order success with details
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getOrderById } from '@/lib/actions/checkout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Package, MapPin, Calendar, Download, Phone, Loader2 } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

function OrderConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [])

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setError('Order ID not found')
        setIsLoading(false)
        return
      }

      try {
        const result = await getOrderById(orderId)
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to load order')
        }

        setOrder(result.data)
      } catch (err: any) {
        console.error('Load order error:', err)
        setError(err.message || 'Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Banner */}
        <Card className="p-8 mb-8 text-center" data-testid="order-success-banner">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <div className="inline-block bg-orange-50 px-6 py-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-orange-600" data-testid="order-number">
              {order.order_number}
            </p>
          </div>
        </Card>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Delivery Address */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
            </div>
            {order.shipping_address && (
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold">{order.shipping_address.contact_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}
                </p>
                <p className="pt-2">{order.shipping_address.contact_phone}</p>
              </div>
            )}
          </Card>

          {/* Order Info */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Order Information</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className="font-medium text-green-600 capitalize">{order.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status</span>
                <span className="font-medium text-blue-600 capitalize">{order.order_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900">{order.payment_method || 'Online'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  {item.variant_name && (
                    <p className="text-sm text-gray-600">{item.variant_name}</p>
                  )}
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{(item.total_price || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{(item.unit_price || 0).toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>GST ({order.gst_percentage || 18}%)</span>
              <span>₹{(order.gst_amount || order.tax || 0).toLocaleString('en-IN')}</span>
            </div>
            {order.shipping_cost > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>₹{order.shipping_cost.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>₹{(order.total_amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              <Package className="w-5 h-5 mr-2" />
              View All Orders
            </Button>
          </Link>
          <Link href="/catalog" className="flex-1">
            <Button className="w-full" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                If you have any questions about your order, our support team is here to help.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
