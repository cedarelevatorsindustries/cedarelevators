"use client"

import { Plus } from "lucide-react"
import Image from "next/image"

export const QuickReorder = () => {
    const items = [
        { id: 1, name: "Guide Rails T70", price: "₹4,500", image: "/images/rail.png" },
        { id: 2, name: "Door Lock", price: "₹1,200", image: "/images/lock.png" },
        { id: 3, name: "COP Button", price: "₹450", image: "/images/button.png" },
        { id: 4, name: "Oil Can", price: "₹850", image: "/images/oil.png" },
    ]

    return (
        <div className="px-4 pb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Quick Reorder</h2>
                <button className="text-sm font-bold text-blue-600">View All</button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {items.map((item) => (
                    <div key={item.id} className="min-w-[140px] bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 relative">
                            {/* Placeholder for image */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                Image
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-gray-900">{item.price}</span>
                            <button className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
