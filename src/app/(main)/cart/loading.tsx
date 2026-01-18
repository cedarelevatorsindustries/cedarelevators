/**
 * Cart Loading Skeleton
 * Provides instant visual feedback while cart data loads
 */

export default function CartLoading() {
    return (
        <div className="container py-8 pt-24 max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
                {/* Header */}
                <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>

                {/* Cart Items Skeleton */}
                <div className="space-y-4 mb-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="flex justify-between items-center">
                                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Skeleton */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                        <div className="h-5 bg-gray-200 rounded w-28"></div>
                    </div>
                    <div className="h-12 bg-gray-200 rounded-lg w-full mt-4"></div>
                </div>
            </div>
        </div>
    )
}
