"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

interface FilterBarProps {
    title: string
    filters: Array<{
        id: string
        name: string
        count?: number
    }>
    activeFilter: string | null
    paramName: 'category' | 'subcategory'
}

export function HorizontalFilterBar({ title, filters, activeFilter, paramName }: FilterBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleFilterSelect = (filterId: string | null) => {
        const url = new URL(window.location.href)
        if (filterId) {
            url.searchParams.set(paramName, filterId)
        } else {
            url.searchParams.delete(paramName)
        }
        router.push(url.pathname + url.search, { scroll: false })
    }

    if (filters.length === 0) {
        return null
    }

    return (
        <div className="bg-white border-b border-gray-200 sticky top-[70px] z-10 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-8 py-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {title}:
                    </span>

                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {/* All Button */}
                        <button
                            onClick={() => handleFilterSelect(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${!activeFilter
                                ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:text-orange-600'
                                }`}
                        >
                            All
                        </button>

                        {/* Filter Chips */}
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => handleFilterSelect(filter.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-2 ${activeFilter === filter.id
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:text-orange-600'
                                    }`}
                            >
                                <span>{filter.name}</span>
                                {filter.count !== undefined && (
                                    <span className={`text-xs ${activeFilter === filter.id ? 'opacity-90' : 'opacity-60'
                                        }`}>
                                        ({filter.count})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
