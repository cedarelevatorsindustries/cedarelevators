'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getOrder } from '@/lib/actions/orders'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import { Loader2, Package, Truck, Calendar, Check, Copy, CheckCircle2, Mail, Clock, ShieldCheck, FileText, Lock, MapPin } from 'lucide-react'
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

      <div className="max-w-6xl mx-auto">
        {/* Success Icon */}
        <div ref={headerRef} className="flex flex-col items-center text-center mb-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-green-100/50 rounded-full blur-xl"></div>
            <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-green-100">
              {!animationComplete ? (
                animationData && (
                  <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    loop={false}
                    autoplay={true}
                    style={{ width: 100, height: 100 }}
                    onComplete={() => setAnimationComplete(true)}
                  />
                )
              ) : (
                <img
                  src="/animation/tick.svg"
                  alt="Success"
                  className="w-16 h-16"
                />
              )}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
            Order Placed Successfully!
          </h1>
          <p className="text-green-700 font-medium text-lg max-w-lg leading-relaxed">
            Thank you! Your order is confirmed and being prepared for dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="overflow-hidden shadow-sm border-gray-200">
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Reference ID
                      </p>
                      <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{order.order_number}</h2>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="mt-8 p-1.5 hover:bg-gray-100 rounded-md transition-colors group"
                      aria-label="Copy order ID"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400 group-hover:text-orange-600" />
                      )}
                    </button>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-200 uppercase tracking-wide">
                    Confirmed
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-8 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Date & Time</p>
                    <p className="text-base font-semibold text-gray-900">
                      {orderDate} <span className="text-gray-300 mx-1">|</span> {orderTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Payment Method</p>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-gray-900">{isCOD ? 'Cash on Delivery' : 'Prepaid'}</p>
                      {isCOD && (
                        <p className="text-xs text-gray-500">Keep ₹{Math.round(order.total_amount || 0).toLocaleString('en-IN')} ready (Cash / UPI accepted)</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{Math.round(order.total_amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Estimated Delivery</p>
                    <p className="text-xl font-bold text-gray-900">3–5 working days</p>
                  </div>
                </div>

                {/* Address Section */}
                {order.shipping_address && (
                  <div className="mb-2">
                    <p className="text-lg font-bold text-gray-900 mb-3">Delivery Address</p>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="text-gray-600 leading-relaxed">
                        {order.shipping_address.address_line1 && <p>{order.shipping_address.address_line1}</p>}
                        {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                        <p>
                          {order.shipping_address.city}
                          {order.shipping_address.state && `, ${order.shipping_address.state}`}
                          {order.shipping_address.pincode && ` - ${order.shipping_address.pincode}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust Badges Footer */}
              <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100 flex flex-wrap gap-4 md:gap-8 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  Verified Business
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Secure Order
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  GST invoice included
                </div>
              </div>
            </Card>
            <p className="text-xs text-gray-500 pl-2">• In addition, a delivery charge will apply.</p>
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 space-y-2">
              <Link href="/profile/orders" className="block">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-base py-6 rounded-lg shadow-md shadow-orange-500/20 transition-all hover:shadow-lg flex items-center justify-center gap-3">
                  <Truck className="w-5 h-5" />
                  Track Order
                </Button>
              </Link>
              <Link href="/catalog" className="block">
                <Button
                  variant="ghost"
                  className="w-full text-gray-700 font-semibold py-6 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all flex items-center justify-center gap-3"
                >
                  Explore More Parts
                </Button>
              </Link>
            </div>

            {/* Processing Timeline */}
            <Card className="p-0 overflow-hidden shadow-sm border-gray-200">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  What Happens Next
                </h3>
              </div>
              <div className="p-6 relative">
                {/* Vertical Line Container */}
                <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-gray-100" />

                <div className="space-y-8 relative">
                  {timelineSteps.map((step, index) => (
                    <div key={index} className="flex gap-4 relative">
                      <div className="flex-shrink-0 z-10">
                        {/* Icon Circle */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${step.status === 'current'
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                            : 'bg-white border-2 border-gray-200 text-gray-400'
                            }`}
                        >
                          {step.icon}
                        </div>
                      </div>

                      <div className="pt-0.5 pb-2">
                        <h4
                          className={`text-sm font-bold mb-1 ${step.status === 'current' ? 'text-gray-900' : 'text-gray-600'
                            }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{step.description}</p>
                        {step.status === 'current' && (
                          <span className="text-[10px] font-bold text-orange-600 mt-2 inline-block bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                            CURRENT STEP
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Help Footer */}
                  <div className="flex gap-4 relative pt-4 mt-4 border-t border-gray-100 border-dashed">
                    <div className="w-8 flex justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5" />
                    </div>
                    <div className="text-xs text-gray-400">
                      Need help? Contact our support team with your Order ID
                    </div>
                  </div>
                </div>
              </div>
            </Card>
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
