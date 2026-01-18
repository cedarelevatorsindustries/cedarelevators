/**
 * Quotes Loading Skeleton
 * Provides instant visual feedback while quotes data loads
 */

export default function QuotesLoading() {
    return (
        <div className="container py-8 pt-24 max-w-7xl mx-auto px-4">
            {/* Header Skeleton */}
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>

                {/* Tabs Skeleton */}
                <div className="flex gap-4 mb-6">
                    <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                    <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                    <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                </div>

                {/* Quote Cards Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
