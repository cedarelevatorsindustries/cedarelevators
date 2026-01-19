"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface PolicyNavigationProps {
    className?: string
}

const POLICIES = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Shipping Policy", href: "/shipping-policy" },
]

export function PolicyNavigation({ className }: PolicyNavigationProps) {
    const pathname = usePathname()

    return (
        <div className={cn("flex justify-center items-center gap-2 flex-wrap", className)}>
            {POLICIES.map((policy) => {
                const isActive = pathname === policy.href
                return (
                    <Link
                        key={policy.href}
                        href={policy.href}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                            isActive
                                ? "bg-orange-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                    >
                        {policy.label}
                    </Link>
                )
            })}
        </div>
    )
}
