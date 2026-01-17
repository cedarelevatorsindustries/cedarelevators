'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getOrder } from '@/lib/actions/orders'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import { Loader2, Package, Truck, Calendar, Check, Copy, CheckCircle2, Mail, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animationData, setAnimationData] = useState<any>(null)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/animation/Tick Animation.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Failed to load animation:', err))

    // Show email confirmation toast
    const timer = setTimeout(() => {
      toast.success('We\'ve emailed the invoice to you', {
        duration: 4000,
      })
    }, 1500)

    // Sticky header on scroll (mobile)
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom
        setShowStickyHeader(headerBottom < 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setError('Order ID not found')
        setIsLoading(false)
        return
      }

      try {
        const result = await getOrder(orderId)

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
  }, [orderId])

  const copyToClipboard = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number)
      setCopied(true)
      toast.success('Order ID copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

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

  // Format order date
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' IST'

  // Determine payment method text
  const isCOD = order.payment_method?.toLowerCase().includes('cod') ||
    order.payment_method?.toLowerCase().includes('cash on delivery')

  const timelineSteps = [
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: 'Order Confirmation Email',
      description: "We've sent a detailed receipt and order summary to your registered email address.",
      status: 'current' as const,
    },
    {
      icon: <Package className="w-4 h-4" />,
      title: isCOD ? 'Processing COD Order' : 'Processing Your Order',
      description: isCOD
        ? 'Our team is verifying your delivery address. Since this is a Cash on Delivery order, please ensure you have the exact amount ready upon arrival.'
        : 'Our team is verifying your order and preparing it for shipment.',
      status: 'pending' as const,
    },
    {
      icon: <Truck className="w-4 h-4" />,
      title: 'Shipped & Tracked',
      description: "Once your package leaves the warehouse, we'll notify you with a tracking number via SMS and email.",
      status: 'pending' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-36 pb-12 px-4">
      {/* Sticky Header - Mobile Only */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md transition-transform duration-300 lg:hidden ${showStickyHeader ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
            <p className="text-lg font-bold text-gray-900">{order.order_number}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Copy order ID"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Success Icon */}
        <div ref={headerRef} className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100">
            {!animationComplete ? (
              animationData && (
                <Lottie
                  lottieRef={lottieRef}
                  animationData={animationData}
                  loop={false}
                  autoplay={true}
                  style={{ width: 80, height: 80 }}
                  onComplete={() => setAnimationComplete(true)}
                />
              )
            ) : (
              <img
                src="/animation/tick.svg"
                alt="Success"
                className="w-12 h-12"
              />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-3">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
            Thank you for choosing us. We've received your order and we're getting it ready for delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Order Summary Card */}
            <Card className="overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Reference ID
                      </p>
                      <h2 className="text-2xl font-bold text-gray-900">{order.order_number}</h2>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="mt-6 p-1.5 hover:bg-gray-100 rounded-md transition-colors group"
                      aria-label="Copy order ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                      )}
                    </button>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-md border border-green-100">
                    CONFIRMED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {orderDate} • {orderTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">{isCOD ? 'Cash on Delivery' : 'Prepaid'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Estimated Delivery</p>
                    <p className="text-sm font-medium text-gray-900">September 18, 2023</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Processing Timeline */}
            <Card className="p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-8 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                What Happens Next
              </h3>

              <div className="relative space-y-0">
                {timelineSteps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {/* Icon Circle */}
                      <div
                        className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'current'
                            ? 'bg-orange-600 text-white ring-4 ring-orange-50'
                            : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                          }`}
                      >
                        {step.icon}
                      </div>

                      {/* Connecting Line */}
                      {index < timelineSteps.length - 1 && (
                        <div className="h-12 w-0.5 bg-gradient-to-b from-gray-200 via-gray-200 to-transparent bg-[length:2px_8px] bg-repeat-y"></div>
                      )}
                    </div>

                    <div className="pt-1">
                      <h4
                        className={`text-sm font-semibold ${step.status === 'current' ? 'text-gray-900' : 'text-gray-600'
                          }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                      {step.status === 'current' && (
                        <span className="text-[10px] font-bold text-orange-600 mt-1 inline-block">
                          CURRENT STEP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link href="/profile/orders">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6 px-6 rounded-xl shadow-lg shadow-orange-500/10 flex items-center justify-center gap-3">
                  <Truck className="w-5 h-5" />
                  Track Order
                </Button>
              </Link>
              <Link href="/catalog">
                <Button
                  variant="outline"
                  className="w-full font-semibold py-6 px-6 rounded-xl flex items-center justify-center gap-3"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  )
}
