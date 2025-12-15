"use client"

import { TrendingUp, Package, FileText, CheckCircle, MessageSquare } from "lucide-react"

export default function QuickPerformanceSnapshot() {
  const stats = [
    {
      label: "Sales This Month",
      value: "₹1,25,000",
      trend: "↑24%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/profile/orders?period=month"
    },
    {
      label: "Pending Quotes",
      value: "4",
      trend: "",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/profile/quotes?status=pending"
    },
    {
      label: "Approved & Ready",
      value: "2",
      action: "→ Convert to Order",
      trend: "",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/profile/quotes?status=approved"
    },
    {
      label: "Total Orders",
      value: "12",
      trend: "↑28%",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/profile/orders"
    },
    {
      label: "Active Inquiries",
      value: "7",
      subtext: "new",
      trend: "",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/profile/quotes?status=negotiation"
    }
  ]

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Performance Snapshot</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <a
            key={index}
            href={stat.href}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all hover:border-blue-300 cursor-pointer group"
          >
            <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.trend && (
                  <span className="text-xs font-medium text-green-600">{stat.trend}</span>
                )}
              </div>
              {stat.subtext && (
                <p className="text-xs text-gray-500">{stat.subtext}</p>
              )}
              {stat.action && (
                <p className="text-xs text-blue-600 font-medium group-hover:underline">{stat.action}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
