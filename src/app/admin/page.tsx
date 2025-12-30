"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, ShoppingCart, Users, Settings, FolderTree, FileText } from "lucide-react"
import Link from "next/link"
import { QuotationChart } from "./components/quotation-chart"
import { RecentOrders } from "@/modules/admin/dashboard/recent-orders"

// Simple placeholder stats
const quickStats = [
  { title: "Total Products", value: "—", icon: Package, href: "/admin/products" },
  { title: "Total Orders", value: "—", icon: ShoppingCart, href: "/admin/orders" },
  { title: "Quote Requests", value: "—", icon: FileText, href: "/admin/quotes" },
  { title: "Categories", value: "—", icon: FolderTree, href: "/admin/categories" },
  { title: "Customers", value: "—", icon: Users, href: "/admin/customers" },
]

const quickActions = [
  { title: "Add Product", href: "/admin/products/create", icon: Plus, primary: true },
  { title: "View Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "View Quotes", href: "/admin/quotes", icon: FileText },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

// Mock data for recent orders
const mockOrders: any[] = [
  {
    id: "ord_1",
    order_number: "ORD-001",
    customer_name: "Rajesh Kumar",
    customer_email: "rajesh@example.com",
    items_count: 2,
    total_amount: 45000,
    status: "processing",
    created_at: new Date().toISOString()
  },
  {
    id: "ord_2",
    order_number: "ORD-002",
    customer_name: "Priya Sharma",
    customer_email: "priya@example.com",
    items_count: 1,
    total_amount: 12000,
    status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "ord_3",
    order_number: "ORD-003",
    customer_name: "Amit Patel",
    customer_email: "amit@example.com",
    items_count: 5,
    total_amount: 125000,
    status: "delivered",
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome to Cedar Elevators Admin Panel
          </p>
        </div>
      </div>

      {/* Quick Stats Grid - 5 Columns */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {quickStats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-b from-white to-orange-50/30 border-orange-100/60 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions - Horizontal Bar */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap items-center gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant={action.primary ? "default" : "outline"}
              className={`h-12 px-6 ${action.primary ? "bg-orange-600 hover:bg-orange-700 text-white" : "hover:bg-gray-50 bg-white border-gray-200"}`}
              asChild
            >
              <Link href={action.href} className="flex items-center gap-2">
                <action.icon className="h-5 w-5" />
                <span className="font-medium">{action.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-8">
        {/* Chart Section */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Quotations Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <QuotationChart />
          </CardContent>
        </Card>

        {/* Recent Activities / Orders */}
        <div>
          <RecentOrders orders={mockOrders} />
        </div>
      </div>
    </div>
  )
}
