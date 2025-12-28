/**
 * Enhanced 500 Error Page
 * Custom error page for server errors
 */

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Illustration */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
            500
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500 animate-pulse">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Something Went Wrong</h2>
          <p className="text-muted-foreground text-lg">
            We're sorry, but something unexpected happened. Our team has been notified and is working on it.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
              <p className="text-sm font-mono text-red-600 dark:text-red-400">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={reset}
            className="gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline" className="gap-2">
              <Home className="h-5 w-5" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{' '}
            <a
              href="mailto:support@cedarelevators.com"
              className="text-primary hover:underline font-medium"
            >
              support@cedarelevators.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
