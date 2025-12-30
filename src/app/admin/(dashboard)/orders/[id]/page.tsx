"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
  CreditCard,
  User
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

// Mock Data (Duplicated for demo purposes to ensure consistency without external state)
const mockOrders: any[] = [
  {
    id: "ord_1",
    order_number: "ORD-001",
    guest_name: "Rajesh Kumar",
    guest_email: "rajesh@example.com",
    guest_phone: "+91 98765 43210",
    order_status: "processing",
    payment_status: "paid",
    total_amount: 45000,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    shipping_address: {
      address_line1: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India"
    },
    order_items: [
      {
        id: "item_1",
        product_name: "Luxury Home Elevator",
        variant_name: "Gold Finish",
        quantity: 1,
        unit_price: 45000,
        total_price: 45000
      }
    ]
  },
  {
    id: "ord_2",
    order_number: "ORD-002",
    guest_name: "Priya Sharma",
    guest_email: "priya@example.com",
    order_status: "pending",
    payment_status: "unpaid",
    total_amount: 15000,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    shipping_address: {
      address_line1: "45 Park Avenue",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      country: "India"
    },
    order_items: [
      { id: "item_2", product_name: "Hydraulic Pump", quantity: 1, unit_price: 15000, total_price: 15000 }
    ]
  },
  {
    id: "ord_3",
    order_number: "ORD-003",
    guest_name: "Amit Patel",
    guest_email: "amit@example.com",
    order_status: "delivered",
    payment_status: "paid",
    total_amount: 125000,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    shipping_address: {
      address_line1: "789 Lake View",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380001",
      country: "India"
    },
    order_items: [
      { id: "item_3", product_name: "Glass Elevator Cabin", quantity: 1, unit_price: 125000, total_price: 125000 }
    ]
  },
  {
    id: "ord_4",
    order_number: "ORD-004",
    guest_name: "Sneha Gupta",
    guest_email: "sneha@example.com",
    order_status: "shipped",
    payment_status: "paid",
    total_amount: 8500,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    shipping_address: {
      address_line1: "12 Civil Lines",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      country: "India"
    },
    order_items: [
      { id: "item_4", product_name: "Elevator Buttons Set", quantity: 5, unit_price: 1700, total_price: 8500 }
    ]
  },
  {
    id: "ord_5",
    order_number: "ORD-005",
    guest_name: "Vikram Singh",
    guest_email: "vikram@example.com",
    order_status: "cancelled",
    payment_status: "refunded",
    total_amount: 32000,
    created_at: new Date(Date.now() - 400000000).toISOString(),
    shipping_address: {
      address_line1: "99 Pink City Rd",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      country: "India"
    },
    order_items: [
      { id: "item_5", product_name: "Door Mechanism", quantity: 2, unit_price: 16000, total_price: 32000 }
    ]
  }
]

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Find mock order
  const order = mockOrders.find(o => o.id === id) || mockOrders[0] // Fallback directly to helpful data if not found for demo

  if (!order) {
    return <div className="p-8 text-center text-gray-500">Order not found</div>
  }

  const {
    order_number,
    guest_name,
    guest_email,
    guest_phone,
    order_status,
    payment_status,
    total_amount,
    created_at,
    shipping_address,
    order_items
  } = order

  const getStatusColor = (status: string) => {
    switch (status) {
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
            <span>Placed on {new Date(created_at).toLocaleDateString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-200">
            <Printer className="mr-2 h-4 w-4" />
            Print Order
          </Button>
          <Button variant="outline" className="border-gray-200">
            <Download className="mr-2 h-4 w-4" />
            Invoice
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
                {order_items.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-start gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                      {item.variant_name && <p className="text-sm text-gray-500">{item.variant_name}</p>}
                      <div className="mt-1 text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{item.unit_price?.toLocaleString() || item.total_price.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right font-medium text-gray-900">
                      ₹{item.total_price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50/50 p-6 space-y-2 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>₹0.00</span>
                </div>
                <div className="pt-2 flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>₹{total_amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline/History (Placeholder) */}
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
                {['processing', 'shipped', 'delivered'].includes(order_status) && (
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white"></span>
                    <h4 className="font-medium text-sm text-gray-900">Payment Confirmed</h4>
                    <p className="text-xs text-gray-500">Payment via Credit Card</p>
                  </div>
                )}
                {order_status === 'delivered' && (
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
                <p className="text-sm font-medium text-gray-900">{guest_name}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-orange-600 hover:underline cursor-pointer">
                  <Mail className="h-3 w-3" />
                  {guest_email}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Phone className="h-3 w-3" />
                  {guest_phone || "+91 98765 43210"}
                </div>
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
              <div className="text-sm text-gray-600 space-y-1">
                <p>{shipping_address.address_line1}</p>
                <p>{shipping_address.city}, {shipping_address.state} {shipping_address.pincode}</p>
                <p>{shipping_address.country}</p>
              </div>
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
                <Badge variant="outline" className={`${payment_status === 'paid' ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-200 text-red-700 bg-red-50'}`}>
                  {payment_status}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-600">Method</span>
                <span className="text-sm font-medium text-gray-900">Online Payment</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}