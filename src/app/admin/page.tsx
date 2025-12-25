"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, ShoppingCart, Users, BarChart3, Settings, FolderTree } from "lucide-react"
import Link from "next/link"

// Simple placeholder stats
const quickStats = [
  { title: "Total Products", value: "—", icon: Package, href: "/admin/products" },
  { title: "Total Orders", value: "—", icon: ShoppingCart, href: "/admin/orders" },
  { title: "Categories", value: "—", icon: FolderTree, href: "/admin/categories" },
  { title: "Customers", value: "—", icon: Users, href: "/admin/customers" },
]

const quickActions = [
  { title: "Add Product", href: "/admin/products/create", icon: Plus, primary: true },
  { title: "View Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            Welcome to Cedar Elevators Admin Panel
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">Click to manage</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant={action.primary ? "default" : "outline"}
                className={action.primary ? "bg-orange-600 hover:bg-orange-700" : ""}
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

      {/* Setup Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-lg text-orange-800">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="text-orange-700">
          <p>
            This admin panel has been set up with basic authentication. To enable full analytics
            and dashboard features, you'll need to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Create the required database tables (admin_settings, admin_profiles)</li>
            <li>Set up the analytics queries for your elevator product data</li>
            <li>Configure environment variables (SUPABASE_SERVICE_ROLE_KEY, ADMIN_SETUP_KEY)</li>
          </ul>
          <div className="mt-4">
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Go to Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
