"use client"

import { 
  Package, 
  FileText, 
  Building2, 
  Users, 
  TrendingUp, 
  ClipboardList,
  CreditCard,
  Settings
} from "lucide-react"
import Link from "next/link"
import type { AuthUser } from "@/lib/auth/server"

interface BusinessDashboardProps {
  user: AuthUser
  companyName?: string | null
}

export default function BusinessDashboard({ user, companyName }: BusinessDashboardProps) {
  const quickActions = [
    { icon: Package, label: "Orders", href: "/orders", count: 8 },
    { icon: FileText, label: "Quotes", href: "/quotes", count: 3 },
    { icon: ClipboardList, label: "Bulk Orders", href: "/bulk-orders" },
    { icon: CreditCard, label: "Invoices", href: "/invoices", count: 2 },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Building2, label: "Company", href: "/company" },
    { icon: TrendingUp, label: "Analytics", href: "/analytics" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  const stats = [
    { label: "Total Orders", value: "156", change: "+12%" },
    { label: "Pending Quotes", value: "3", change: "" },
    { label: "This Month", value: "₹24,500", change: "+8%" },
    { label: "Credit Limit", value: "₹50,000", change: "" },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#F97316]/10 rounded-lg">
            <Building2 className="w-6 h-6 text-[#F97316]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {companyName || "Business Dashboard"}
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.firstName || "there"}!
            </p>
          </div>
        </div>
        <span className="inline-block px-3 py-1 bg-[#F97316] text-white text-xs font-bold rounded-full">
          Business Account
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-500 mb-1">
              {stat.label}
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {stat.value}
              </span>
              {stat.change && (
                <span className="text-sm font-medium text-green-500">
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="relative flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 hover:border-[#F97316] hover:shadow-md transition-all"
            >
              <action.icon className="w-8 h-8 text-[#1E3A8A] mb-3" />
              <span className="text-sm font-medium text-gray-900">
                {action.label}
              </span>
              {action.count && (
                <span className="absolute top-2 right-2 bg-[#F97316] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {action.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Business Features Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Request Quote Card */}
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2D5BFF] rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Need a Bulk Quote?</h3>
          <p className="text-white/80 mb-4">
            Get special pricing for large orders. Our team will respond within 24 hours.
          </p>
          <Link
            href="/request-quote"
            className="inline-block px-6 py-2 bg-white text-[#1E3A8A] font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Request Quote
          </Link>
        </div>

        {/* Tax Invoice Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Tax Invoices
          </h3>
          <p className="text-gray-600 mb-4">
            Download GST-compliant invoices for all your business purchases.
          </p>
          <Link
            href="/invoices"
            className="inline-block px-6 py-2 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#F97316]/90 transition-colors"
          >
            View Invoices
          </Link>
        </div>
      </div>
    </div>
  )
}
