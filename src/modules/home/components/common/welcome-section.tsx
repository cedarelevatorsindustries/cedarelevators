"use client"

import { useState, useEffect } from "react"
import { MessageSquare } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/lib/auth/client"

interface WelcomeSectionProps {
    userType: "individual" | "business" | "verified"
}

export function WelcomeSection({ userType }: WelcomeSectionProps) {
    const { user } = useUser()
    const [userName, setUserName] = useState("")

    useEffect(() => {
        if (user) {
            // Use name from EnhancedUser, or extract from email
            const displayName = user.name || user.email?.split('@')[0] || "User"
            setUserName(displayName)
        }
    }, [user])

    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-[1440px] mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Welcome Message */}
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Welcome to Cedar Elevators, {userName}
                        </h1>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {userType === 'individual' && (
                            <Link
                                href="/quotes"
                                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Quote Hub
                            </Link>
                        )}
                        <Link
                            href="/quotes/new"
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Request for Quotation
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

