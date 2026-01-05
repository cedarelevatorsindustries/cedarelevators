"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { useState } from "react"

interface FilterOption {
    id: string
    name: string
    count?: number
}

interface FilterSidebarProps {
    title: string
    filters: FilterOption[]
    activeFilter: string | null
    onFilterChange: (filterId: string | null) => void
}

export function FilterSidebar({
    title,
    filters,
    activeFilter,
    onFilterChange
}: FilterSidebarProps) {
    const [open, setOpen] = useState(false)

    const handleFilterSelect = (filterId: string | null) => {
        onFilterChange(filterId)
        setOpen(false)
    }

    return (
        <>
            {/* Filter Button - Fixed at bottom right */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="default"
                        size="lg"
                        className="fixed bottom-6 right-6 z-50 shadow-lg bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 px-6"
                    >
                        <Filter className="h-5 w-5 mr-2" />
                        {title}
                        {activeFilter && (
                            <span className="ml-2 bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                1
                            </span>
                        )}
                    </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
                    </SheetHeader>

                    <div className="mt-6 space-y-2">
                        {/* All Option */}
                        <button
                            onClick={() => handleFilterSelect(null)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${!activeFilter
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">All {title}</span>
                                {!activeFilter && (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </button>

                        {/* Filter Options */}
                        {filters.length > 0 ? (
                            filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => handleFilterSelect(filter.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeFilter === filter.id
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{filter.name}</span>
                                        <div className="flex items-center gap-2">
                                            {filter.count !== undefined && (
                                                <span className={`text-sm ${activeFilter === filter.id ? 'opacity-90' : 'opacity-60'
                                                    }`}>
                                                    ({filter.count})
                                                </span>
                                            )}
                                            {activeFilter === filter.id && (
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Filter className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No filters available</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Active Filter Chip - Fixed at top */}
            {activeFilter && filters.length > 0 && (
                <div className="fixed top-20 left-4 z-40 animate-in slide-in-from-left">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
                        <Filter className="h-4 w-4" />
                        <span className="font-medium">
                            {filters.find(f => f.id === activeFilter)?.name || 'Filter'}
                        </span>
                        <button
                            onClick={() => onFilterChange(null)}
                            className="hover:bg-orange-600 rounded-full p-1 transition-colors"
                            aria-label="Clear filter"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
