"use client"

import { Package } from "lucide-react"
import LocalizedClientLink from "@/components/ui/localized-client-link"
import type { ElevatorType } from "@/lib/data/elevator-types"

interface ElevatorTypesMobileProps {
    elevatorTypes: ElevatorType[]
}

export default function ElevatorTypesMobile({ elevatorTypes }: ElevatorTypesMobileProps) {
    // Take first 4 elevator types for mobile display
    const displayTypes = elevatorTypes.slice(0, 4)

    if (displayTypes.length === 0) {
        return null
    }

    return (
        <div className="bg-white py-6 px-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Shop by Elevator Type</h2>
                <LocalizedClientLink
                    href="/types"
                    className="text-xs font-bold text-blue-600"
                >
                    View All
                </LocalizedClientLink>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {displayTypes.map((type) => (
                    <LocalizedClientLink
                        key={type.id}
                        href={`/types/${type.slug}`}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {type.thumbnail_image ? (
                                <img src={type.thumbnail_image} alt={type.title} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                '🏢'
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                                {type.title}
                            </div>
                            {type.description && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {type.description}
                                </div>
                            )}
                        </div>
                    </LocalizedClientLink>
                ))}
            </div>
        </div>
    )
}

