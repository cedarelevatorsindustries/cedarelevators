"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Tab {
    id: string
    label: string
    icon?: ReactNode
}

interface TabLayoutProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    children: ReactNode
    className?: string
}

export function TabLayout({ tabs, activeTab, onTabChange, children, className }: TabLayoutProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                                activeTab === tab.id
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            )}
                            aria-current={activeTab === tab.id ? "page" : undefined}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="py-2">
                {children}
            </div>
        </div>
    )
}

interface TabPanelProps {
    id: string
    activeTab: string
    children: ReactNode
    className?: string
}

export function TabPanel({ id, activeTab, children, className }: TabPanelProps) {
    if (id !== activeTab) return null

    return (
        <div className={cn("space-y-6", className)} role="tabpanel">
            {children}
        </div>
    )
}

