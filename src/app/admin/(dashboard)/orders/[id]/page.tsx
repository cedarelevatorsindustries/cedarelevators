import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  Printer,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  User
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { getOrderById } from "@/lib/data/orders"
import { notFound } from "next/navigation"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch actual order data from database
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  const {
    order_number,
    clerk_user_id,
    guest_name,
    guest_email,
    order_status,
    payment_status,
    payment_method,
    subtotal_amount,
    tax_amount,
    shipping_amount,
    total_amount,
    created_at,
    shipping_address,
    billing_address,
    order_items
  } = order

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'processing': return 'bg-purple-100 text-purple-700'
      case 'shipped': return 'bg-orange-100 text-orange-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="-ml-3 text-gray-500" asChild>
              <Link href="/admin/orders">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Orders
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{order_number}</h1>
            <Badge className={`${getStatusColor(order_status)} border-0 px-2 py-0.5 uppercase`}>
              {order_status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Placed on {new Date(created_at).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-200" asChild>
            <a href={`/api/orders/${id}/invoice`} target="_blank" rel="noopener noreferrer">
              <Printer className="mr-2 h-4 w-4" />
              Print Order
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Items & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {order_items?.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-start gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                      {item.variant_name && <p className="text-sm text-gray-500">{item.variant_name}</p>}
                      <div className="mt-1 text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{item.unit_price?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="text-right font-medium text-gray-900">
                      ₹{((item.unit_price || 0) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50/50 p-6 space-y-2 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{Math.round(subtotal_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping_amount > 0 ? `₹${Math.round(shipping_amount).toLocaleString()}` : 'Paid on delivery'}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (GST)</span>
                  <span>₹{Math.round(tax_amount || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>₹{Math.round(total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline/History */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 border-l-2 border-gray-100 ml-2 pl-4 relative">
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-white"></span>
                  <h4 className="font-medium text-sm text-gray-900">Order Placed</h4>
                  <p className="text-xs text-gray-500">{new Date(created_at).toLocaleString()}</p>
                </div>
                {['processing', 'shipped', 'delivered'].includes(order_status.toLowerCase()) && (
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white"></span>
                    <h4 className="font-medium text-sm text-gray-900">Payment Confirmed</h4>
                    <p className="text-xs text-gray-500">Payment via {payment_method?.toUpperCase() || 'Online'}</p>
                  </div>
                )}
                {order_status.toLowerCase() === 'delivered' && (
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white"></span>
                    <h4 className="font-medium text-sm text-gray-900">Delivered</h4>
                    <p className="text-xs text-gray-500">Package has been delivered to the customer.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{guest_name || 'Customer'}</p>
                {guest_email && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-orange-600 hover:underline cursor-pointer">
                    <Mail className="h-3 w-3" />
                    {guest_email}
                  </div>
                )}
                {billing_address?.phone && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Phone className="h-3 w-3" />
                    {billing_address.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shipping_address && Object.keys(shipping_address).length > 0 ? (
                <div className="text-sm text-gray-600 space-y-1">
                  {shipping_address.name && <p className="font-medium text-gray-900">{shipping_address.name}</p>}
                  {shipping_address.address_line1 && <p>{shipping_address.address_line1}</p>}
                  {shipping_address.address_line2 && <p>{shipping_address.address_line2}</p>}
                  {(shipping_address.city || shipping_address.state || shipping_address.postal_code || shipping_address.pincode) && (
                    <p>
                      {shipping_address.city && `${shipping_address.city}, `}
                      {shipping_address.state && `${shipping_address.state} `}
                      {shipping_address.postal_code || shipping_address.pincode}
                    </p>
                  )}
                  {shipping_address.country && <p>{shipping_address.country}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No shipping address provided</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="outline" className={`${payment_status === 'paid'
                  ? 'border-green-200 text-green-700 bg-green-50'
                  : 'border-yellow-200 text-yellow-700 bg-yellow-50'
                  }`}>
                  {payment_status || 'pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-600">Method</span>
                <span className="text-sm font-medium text-gray-900">
                  {payment_method?.toUpperCase() === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}