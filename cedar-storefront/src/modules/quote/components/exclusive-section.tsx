"use client"

import { Crown, ArrowRight } from "lucide-react"

export const ExclusiveSection = () => {
    return (
        <div className="px-4 pb-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Business Exclusive</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Premium Components</h2>
                    <p className="text-gray-400 text-sm mb-4">Access high-margin industrial parts available only to verified sellers.</p>

                    <button className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                        Browse Exclusive Catalog <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
