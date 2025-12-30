"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, ShoppingCart, Users, Settings, FolderTree, FileText } from "lucide-react"
import Link from "next/link"
import { QuotationChart } from "./components/quotation-chart"
import { RecentActivities, ActivityItem } from "@/modules/admin/dashboard/recent-activities"

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

// Mock data for recent activities
const mockActivities: ActivityItem[] = [
  {
    id: "act_1",
    action: "update",
    entity: "product",
    description: "Updated price for 'Glider 3000'",
    user: "Admin User",
    timestamp: new Date().toISOString(),
    details: "Changed from ₹45,000 to ₹48,000"
  },
  {
    id: "act_2",
    action: "create",
    entity: "quote",
    description: "Created new quote for Customer #452",
    user: "Sales Rep",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "act_3",
    action: "update",
    entity: "settings",
    description: "Updated General Settings",
    user: "Admin User",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    details: "Updated WhatsApp number and Business Hours"
  },
  {
    id: "act_4",
    action: "delete",
    entity: "category",
    description: "Deleted unused category 'Old Parts'",
    user: "System Admin",
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "act_5",
    action: "update",
    entity: "order",
    description: "Updated Order #ORD-003 Status",
    user: "Admin User",
    timestamp: new Date(Date.now() - 250000000).toISOString(), // ~3 days ago
    details: "Status changed to Delivered"
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
      <div className="space-y-8">
        {/* Chart Section */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Quotations Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <QuotationChart />
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <div className="min-h-[400px]">
          <RecentActivities activities={mockActivities} />
        </div>
      </div>
    </div>
  )
}
