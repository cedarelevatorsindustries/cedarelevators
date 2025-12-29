/**
 * Enhanced 404 Not Found Page
 * Custom error page with helpful suggestions
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { House, Search, ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  const suggestions = [
    { label: 'House', href: '/', icon: House },
    { label: 'Products', href: '/products', icon: Search },
    { label: 'Categories', href: '/categories', icon: Search },
    { label: 'Contact', href: '/contact', icon: Search },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-primary animate-bounce">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground text-lg">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <House className="h-5 w-5" />
              Go House
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Suggestions */}
        <div className="pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">You might be looking for:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {suggestions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <item.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Looking for a specific product?{' '}
            <Link href="/products" className="text-primary hover:underline font-medium">
              Browse our catalog
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
