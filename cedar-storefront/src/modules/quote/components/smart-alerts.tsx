"use client"

import { Clock, AlertTriangle, ChevronRight } from "lucide-react"

export const SmartAlerts = () => {
    // Mock logic: show if there are urgent items
    const alerts = [
        { type: "expiry", message: "3 quotes expiring in < 4 hrs", count: 3 },
        // { type: "stock", message: "5 items running low", count: 5 }
    ]

    if (alerts.length === 0) return null

    return (
        <div className="px-4 pb-6">
            {alerts.map((alert, index) => (
                <div
                    key={index}
                    className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center justify-between shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                            <Clock className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-bold text-red-800">{alert.message}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400" />
                </div>
            ))}
        </div>
    )
}
