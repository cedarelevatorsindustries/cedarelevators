"use client"

import { AlertCircle, Clock, Package, CreditCard } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface Alert {
  id: string
  type: "warning" | "info" | "urgent"
  icon: any
  title: string
  message: string
  action: {
    label: string
    href: string
  }
  color: string
  bgColor: string
}

export default function SmartAlerts() {
  const alerts: Alert[] = [
    {
      id: "1",
      type: "urgent",
      icon: Clock,
      title: "Quote Expiring Soon",
      message: "Quote #Q-2345 expires in 2 days. Convert to order now.",
      action: {
        label: "Convert Now",
        href: "/profile/quotes/Q-2345"
      },
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: "2",
      type: "warning",
      icon: AlertCircle,
      title: "Pending Approval",
      message: "2 quotes are awaiting approval from CEDAR team.",
      action: {
        label: "View Quotes",
        href: "/profile/quotes?status=pending"
      },
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      id: "3",
      type: "info",
      icon: Package,
      title: "Low Stock Alert",
      message: "3 items in your wishlist are running low on stock.",
      action: {
        label: "View Items",
        href: "/profile/wishlists"
      },
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ]

  // Only show if there are alerts
  if (alerts.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Smart Alerts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`${alert.bgColor} border-2 ${alert.color.replace('text-', 'border-')} rounded-lg p-5`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`${alert.bgColor} ${alert.color} p-2 rounded-lg`}>
                <alert.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{alert.title}</h3>
                <p className="text-sm text-gray-700">{alert.message}</p>
              </div>
            </div>
            <LocalizedClientLink
              href={alert.action.href}
              className={`inline-block px-4 py-2 ${alert.color.replace('text-', 'bg-')} text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
            >
              {alert.action.label}
            </LocalizedClientLink>
          </div>
        ))}
      </div>
    </section>
  )
}
