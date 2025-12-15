"use client"

import { useState, useEffect } from "react"
import { MessageSquare } from "lucide-react"
import LocalizedClientLink from "@/components/ui/localized-client-link"
import { useUser } from "@/lib/auth/client"

interface WelcomeSectionProps {
    userType: "individual" | "business"
}

export function WelcomeSection({ userType }: WelcomeSectionProps) {
    const { user } = useUser()
    const [userName, setUserName] = useState("")

    useEffect(() => {
        if (user) {
            const firstName = user.firstName || ""
            const lastName = user.lastName || ""
            setUserName(`${firstName} ${lastName}`.trim() || user.emailAddresses[0]?.emailAddress?.split('@')[0] || "User")
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

                    {/* Right: Request Quote Button */}
                    <LocalizedClientLink
                        href="/request-quote"
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Request for Quotation
                    </LocalizedClientLink>
                </div>
            </div>
        </div>
    )
}
