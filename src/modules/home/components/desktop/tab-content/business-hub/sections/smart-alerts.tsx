"use client"

import { AlertCircle, Clock, CheckCircle } from "lucide-react"
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

export default function ActionAlerts() {
  // TODO: Fetch real alerts from backend
  // Only show actionable alerts (max 3)
  const alerts: Alert[] = [
    {
      id: "1",
      type: "urgent",
      icon: Clock,
      title: "Quote Expiring Soon",
      message: "Quote #Q-2345 expires in 2 days. Convert to order now.",
      action: {
        label: "View Quote",
        href: "/profile/quotes/Q-2345"
      },
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: "2",
      type: "warning",
      icon: AlertCircle,
      title: "Verification Pending",
      message: "Your business verification is under review. We'll notify you once approved.",
      action: {
        label: "View Status",
        href: "/profile/business"
      },
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      id: "3",
      type: "info",
      icon: CheckCircle,
      title: "Quote Approved",
      message: "Quote #Q-2301 has been approved. Ready to convert to order.",
      action: {
        label: "Convert Now",
        href: "/profile/quotes?status=accepted"
      },
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ]

  // Limit to max 3 alerts and only show actionable ones
  const actionableAlerts = alerts.slice(0, 3)

  // Hide section if no alerts
  if (actionableAlerts.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Action Needed</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionableAlerts.map((alert) => (
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
