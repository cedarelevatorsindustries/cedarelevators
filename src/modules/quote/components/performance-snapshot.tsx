"use client"

import { TrendingUp, Clock, AlertTriangle, Wallet, LucideIcon } from "lucide-react"

interface StatItem {
    label: string
    value: string
    subtext: string
    icon: LucideIcon
    color: string
    bg: string
    border: string
}

interface PerformanceSnapshotProps {
    stats?: StatItem[]
}

export const PerformanceSnapshot = ({ stats }: PerformanceSnapshotProps) => {
    const defaultStats: StatItem[] = [
        {
            label: "This Month",
            value: "₹1.25L",
            subtext: "↑ 12%",
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100"
        },
        {
            label: "Pending",
            value: "4 Quotes",
            subtext: "Expires soon",
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100"
        },
        {
            label: "Low Stock",
            value: "2 Items",
            subtext: "Reorder now",
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100"
        },
        {
            label: "Next Payout",
            value: "₹68k",
            subtext: "Due in 3 days",
            icon: Wallet,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100"
        }
    ]

    const displayStats = stats || defaultStats

    return (
        <div className="px-4 py-6">
            <div className="grid grid-cols-2 gap-3">
                {displayStats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-xl border ${stat.border} ${stat.bg} relative overflow-hidden`}
                    >
                        <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <p className="text-xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">{stat.label}</p>
                        <p className={`text-[10px] font-bold mt-2 ${stat.color}`}>{stat.subtext}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
