import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function ProfileNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <FileQuestion className="size-16 text-gray-400 dark:text-gray-600 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        The profile page you're looking for doesn't exist or you don't have permission to access it.
      </p>
      <Link
        href="/profile"
        className="px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#ea6a0a] transition-colors font-medium"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
