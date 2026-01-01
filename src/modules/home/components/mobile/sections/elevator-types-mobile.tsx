"use client"

import { Package } from "lucide-react"
import LocalizedClientLink from "@/components/ui/localized-client-link"

// Mock elevator types data
const elevatorTypes = [
    {
        id: "passenger-lift",
        name: "Passenger Lift",
        slug: "passenger-lift",
        icon: "🏢",
        description: "Commercial & Residential"
    },
    {
        id: "hospital-lift",
        name: "Hospital Lift",
        slug: "hospital-lift",
        icon: "🏥",
        description: "Medical Grade"
    },
    {
        id: "goods-lift",
        name: "Goods Lift",
        slug: "goods-lift",
        icon: "📦",
        description: "Heavy Duty Cargo"
    },
    {
        id: "home-lift",
        name: "Home Lift",
        slug: "home-lift",
        icon: "🏠",
        description: "Residential Comfort"
    }
]

export default function ElevatorTypesMobile() {
    return (
        <div className="bg-white py-6 px-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Shop by Elevator Type</h2>
                <LocalizedClientLink
                    href="/elevator-types"
                    className="text-xs font-bold text-blue-600"
                >
                    View All
                </LocalizedClientLink>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {elevatorTypes.map((type) => (
                    <LocalizedClientLink
                        key={type.id}
                        href={`/elevator-types/${type.slug}`}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {type.icon}
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                                {type.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {type.description}
                            </div>
                        </div>
                    </LocalizedClientLink>
                ))}
            </div>
        </div>
    )
}
