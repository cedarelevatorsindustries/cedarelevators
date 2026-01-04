export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="h-16 bg-white border-b border-gray-200 animate-pulse">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block w-64 bg-transparent p-4 space-y-4 fixed top-16 left-0 bottom-0 animate-pulse">
          {/* User Card */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-white rounded-lg border border-gray-200"></div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 lg:ml-64">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10 animate-pulse">
                {/* Title */}
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                
                {/* Content Blocks */}
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

