"use client"

import { Package, Heart, MapPin, Bell, User, ShoppingBag } from "lucide-react"
import Link from "next/link"
import type { EnhancedAuthUser } from "@/lib/auth/server"

interface IndividualDashboardProps {
  user: EnhancedAuthUser
}

export default function IndividualDashboard({ user }: IndividualDashboardProps) {
  const quickActions = [
    { icon: ShoppingBag, label: "My Orders", href: "/orders", count: 3 },
    { icon: Heart, label: "Wishlist", href: "/wishlist", count: 12 },
    { icon: MapPin, label: "Addresses", href: "/addresses" },
    { icon: Bell, label: "Notifications", href: "/notifications", count: 5 },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.clerkUser.firstName || "there"}!
        </h1>
        <p className="text-gray-600">
          Manage your orders, wishlist, and account settings
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Orders
          </h2>
          <Link
            href="/orders"
            className="text-sm font-medium text-[#F97316] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No orders yet</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

