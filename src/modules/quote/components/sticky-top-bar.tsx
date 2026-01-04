"use client"

import { Bell, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface StickyTopBarProps {
    title?: string
    pendingCount?: number
    showBack?: boolean
    showNotifications?: boolean
}

export const StickyTopBar = ({
    title = "Business Hub",
    pendingCount = 0,
    showBack = false,
    showNotifications = true
}: StickyTopBarProps) => {
    const router = useRouter()

    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm h-14">
            {/* Left: Back Button or Empty Spacer */}
            <div className="w-10 flex-shrink-0">
                {showBack && (
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full active:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Center: Title */}
            <div className="flex items-center justify-center gap-2 flex-1">
                <h1 className="text-lg font-bold text-gray-900 text-center truncate">{title}</h1>
                {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {pendingCount}
                    </span>
                )}
            </div>

            {/* Right: Notifications or Empty Spacer */}
            <div className="w-10 flex-shrink-0 flex justify-end">
                {showNotifications && (
                    <button className="relative p-2 -mr-2 text-gray-600 hover:bg-gray-50 rounded-full">
                        <Bell className="w-6 h-6" />
                        {pendingCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

