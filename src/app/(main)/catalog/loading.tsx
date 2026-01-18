/**
 * Catalog Loading Skeleton
 * Provides instant visual feedback while catalog data loads
 */

export default function CatalogLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-200 pt-20 pb-4 px-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>

            {/* Filters Skeleton */}
            <div className="px-4 py-3 flex gap-2 overflow-x-auto animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded-full w-20 flex-shrink-0"></div>
                ))}
            </div>

            {/* Products Grid Skeleton */}
            <div className="px-4 py-4 animate-pulse">
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="aspect-square bg-gray-200"></div>
                            <div className="p-3 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
