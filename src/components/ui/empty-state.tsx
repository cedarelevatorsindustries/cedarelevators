"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    image: string
    title: string
    description: string
    actionLabel: string
    actionLink?: string
    onAction?: () => void
}

export function EmptyState({
    image,
    title,
    description,
    actionLabel,
    actionLink,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative w-64 h-48 mb-6">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-contain"
                />
            </div>
            <h2 className="text-2xl font-bold text-orange-700 mb-3">
                {title}
            </h2>
            <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
                {description}
            </p>

            {onAction ? (
                <button
                    onClick={onAction}
                    className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-medium px-8 py-3 rounded-full shadow-md transition-all transform hover:scale-105"
                >
                    {actionLabel}
                </button>
            ) : actionLink ? (
                <Link href={actionLink}>
                    <button className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-medium px-8 py-3 rounded-full shadow-md transition-all transform hover:scale-105">
                        {actionLabel}
                    </button>
                </Link>
            ) : null}
        </div>
    )
}
