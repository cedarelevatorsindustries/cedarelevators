"use client"

import { Plus, RefreshCw, Grid, Megaphone, LucideIcon } from "lucide-react"
import Link from "next/link"

interface ActionItem {
    label: string
    icon: LucideIcon
    href: string
    color: string
}

interface QuickActionsBarProps {
    actions?: ActionItem[]
}

export const QuickActionsBar = ({ actions }: QuickActionsBarProps) => {
    const defaultActions: ActionItem[] = [
        { label: "Create Quote", icon: Plus, href: "/request-quote/create", color: "bg-blue-600" },
        { label: "Quick Reorder", icon: RefreshCw, href: "/request-quote/reorder", color: "bg-green-600" },
        { label: "Catalog", icon: Grid, href: "/catalog", color: "bg-purple-600" },
        { label: "Broadcast", icon: Megaphone, href: "/broadcast", color: "bg-orange-600" },
    ]

    const displayActions = actions || defaultActions

    return (
        <div className="px-4 pb-6">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {displayActions.map((action, index) => (
                    <Link
                        key={index}
                        href={action.href}
                        className="flex flex-col items-center gap-2 min-w-[80px]"
                    >
                        <div className={`w-14 h-14 rounded-full ${action.color} flex items-center justify-center shadow-lg shadow-gray-200`}>
                            <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                            {action.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
