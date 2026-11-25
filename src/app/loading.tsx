/**
 * Global Loading Skeleton
 * Provides instant visual layout feedback while route data loads
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar Skeleton */}
      <div className="fixed top-0 inset-x-0 z-40 h-16 bg-white/95 border-b border-zinc-200 animate-pulse">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="h-8 w-32 bg-zinc-200 rounded-md" />
            <div className="hidden md:block h-5 w-28 bg-zinc-200 rounded-md" />
          </div>
          <div className="hidden md:block flex-1 max-w-xl h-10 bg-zinc-100 rounded-lg border border-zinc-200" />
          <div className="flex items-center gap-3">
            <div className="hidden lg:block h-9 w-20 bg-zinc-100 rounded-lg" />
            <div className="h-9 w-36 bg-zinc-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="w-full bg-zinc-50 border-b border-zinc-100 pt-32 sm:pt-36 pb-16 sm:pb-20 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-2xl space-y-4 flex-1">
            <div className="h-9 sm:h-11 bg-zinc-200 rounded-lg w-3/4" />
            <div className="h-9 sm:h-11 bg-zinc-200 rounded-lg w-1/2" />
            <div className="h-5 bg-zinc-200 rounded w-5/6 pt-2" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-36 bg-zinc-200 rounded-lg" />
            <div className="h-10 w-36 bg-zinc-100 border border-zinc-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Application Cards Skeleton */}
      <div className="w-full py-10 sm:py-14 px-4 sm:px-6 md:px-8 lg:px-12 animate-pulse">
        <div className="space-y-2 mb-6">
          <div className="h-7 w-56 bg-zinc-200 rounded-md" />
          <div className="h-4 w-80 bg-zinc-100 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-zinc-200 rounded-xl"
            />
          ))}
        </div>
      </div>

      {/* Categories & Featured Products Skeleton */}
      <div className="w-full py-8 px-4 sm:px-6 md:px-8 lg:px-12 animate-pulse">
        <div className="space-y-2 mb-8">
          <div className="h-7 w-64 bg-zinc-200 rounded-md" />
          <div className="h-4 w-72 bg-zinc-100 rounded-md" />
        </div>
        <div className="flex flex-wrap gap-8 sm:gap-10 mb-14">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-zinc-200" />
              <div className="h-4 w-28 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-zinc-50 rounded-xl p-3 space-y-3 border border-zinc-100"
            >
              <div className="aspect-square bg-zinc-200 rounded-xl" />
              <div className="h-5 bg-zinc-200 rounded w-3/4" />
              <div className="h-4 bg-zinc-200 rounded w-1/2" />
              <div className="h-9 bg-zinc-200 rounded-lg w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
