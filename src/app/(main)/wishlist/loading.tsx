/**
 * Wishlist Loading Skeleton
 * Provides instant visual feedback while wishlist data loads
 */

export default function WishlistLoading() {
    return (
        <div className="container py-8 pt-24 max-w-7xl mx-auto px-4">
            <div className="animate-pulse">
                {/* Header */}
                <div className="h-8 bg-gray-200 rounded w-40 mb-6"></div>

                {/* Wishlist Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="aspect-square bg-gray-200"></div>
                            <div className="p-3 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-9 bg-gray-200 rounded w-full mt-2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
