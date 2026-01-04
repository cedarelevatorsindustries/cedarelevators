"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const BottomCTA = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
            <Link
                href="/sign-in"
                className="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl text-center shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                Login to save 12% on bulk <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    )
}

