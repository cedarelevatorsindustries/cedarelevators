'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Profile error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <AlertCircle className="size-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {error.message || 'An error occurred while loading your profile. Please try again.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#ea6a0a] transition-colors font-medium"
        >
          Try Again
        </button>
        <a
          href="/profile"
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}

