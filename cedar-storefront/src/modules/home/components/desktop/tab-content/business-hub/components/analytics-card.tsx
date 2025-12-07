"use client"

import { demoBusinessAnalytics } from "@/lib/data/demo-data"

export default function AnalyticsCard() {
  const { totalOrders, pendingQuotes, monthlyRevenue, activeProducts } = demoBusinessAnalytics

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Analytics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Pending Quotes</p>
          <p className="text-2xl font-bold text-green-600">{pendingQuotes}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
          <p className="text-2xl font-bold text-purple-600">₹{(monthlyRevenue / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Active Products</p>
          <p className="text-2xl font-bold text-orange-600">{activeProducts}</p>
        </div>
      </div>
    </div>
  )
}
