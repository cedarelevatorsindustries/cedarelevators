"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, ShoppingCart, Users, Settings, FolderTree, FileText } from "lucide-react"
import Link from "next/link"
import { QuotationChart } from "./components/quotation-chart"

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

export default function AdminDashboard() {
  return (
    <div className="space-y-6" data-testid="admin-dashboard">
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

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Chart Section */}
        <Card className="md:col-span-4 border-gray-200">
          <CardHeader>
            <CardTitle>Quotations</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <QuotationChart />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-3 border-gray-200 h-fit">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant={action.primary ? "default" : "outline"}
                  className={`w-full justify-start ${action.primary ? "bg-orange-600 hover:bg-orange-700 text-white" : "hover:bg-gray-50"}`}
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.title}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
