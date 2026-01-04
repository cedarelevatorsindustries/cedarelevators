"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, ShoppingCart, Users, Settings, FolderTree, FileText, RefreshCw } from "lucide-react"
import Link from "next/link"
import { QuotationChart } from "./components/quotation-chart"
import { RecentActivities } from "@/modules/admin/dashboard/recent-activities"
import { getQuickStats, QuickStats } from "@/lib/actions/admin-dashboard"
import { getRecentActivity, RecentActivity } from "@/lib/actions/analytics"

const quickActions = [
  { title: "Add Product", href: "/admin/products/create", icon: Plus, primary: true },
  { title: "View Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "View Quotes", href: "/admin/quotes", icon: FileText },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        getQuickStats(),
        getRecentActivity(10)
      ])
      setStats(statsData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadDashboardData()
  }

  const quickStats = [
    { title: "Total Products", value: stats?.totalProducts || 0, icon: Package, href: "/admin/products" },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, href: "/admin/orders" },
    { title: "Quote Requests", value: stats?.quoteRequests || 0, icon: FileText, href: "/admin/quotes" },
    { title: "Categories", value: stats?.totalCategories || 0, icon: FolderTree, href: "/admin/categories" },
    { title: "Customers", value: stats?.totalCustomers || 0, icon: Users, href: "/admin/customers" },
  ]

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    stat.value
                  )}
                </div>
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
          <RecentActivities activities={activities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

