"use client"

import { ChevronRight, House, ArrowLeft } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface BreadcrumbProps {
  pathname: string
}

export function Breadcrumb({ pathname }: BreadcrumbProps) {
  const segments = pathname.split('/').filter(Boolean)

  // Don't show breadcrumb on homepage
  if (segments.length === 0) return null

  // Label mapping for better display names
  const labelMap: Record<string, string> = {
    'catalog': 'All Products',
    'products': 'Products',
    'categories': 'Categories',
    'collections': 'Collections',
    'account': 'My Account',
    'orders': 'Orders',
    'quotes': 'Quotes',
    'bulk-order': 'Bulk Order',
    'request-quote': 'Request Quote',
    'cart': 'Shopping Cart',
    'checkout': 'Checkout',
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = labelMap[segment] || segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return { href, label }
  })

  // Get parent for mobile
  const parent = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : { href: '/', label: 'House' }
  const current = breadcrumbs[breadcrumbs.length - 1]

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-2">
        {/* Desktop Breadcrumb - Full Path */}
        <nav className="hidden md:flex items-center gap-2 text-sm" aria-label="Breadcrumb navigation">
          <LocalizedClientLink
            href="/"
            className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <House size={14} />
            <span>House</span>
          </LocalizedClientLink>

          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-gray-400" />
              {index === breadcrumbs.length - 1 ? (
                <span
                  className="text-gray-900 font-medium truncate max-w-xs"
                  aria-current="page"
                  title={crumb.label}
                >
                  {crumb.label.length > 40 ? `${crumb.label.slice(0, 37)}...` : crumb.label}
                </span>
              ) : (
                <LocalizedClientLink
                  href={crumb.href}
                  className="text-gray-600 hover:text-orange-600 transition-colors truncate max-w-[150px]"
                  title={crumb.label}
                >
                  {crumb.label.length > 25 ? `${crumb.label.slice(0, 22)}...` : crumb.label}
                </LocalizedClientLink>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Breadcrumb - Back Button + Current */}
        <nav className="flex md:hidden items-center gap-3 text-sm" aria-label="Breadcrumb navigation">
          <LocalizedClientLink
            href={parent.href}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            onClick={(e) => {
              // Use browser back for better UX
              e.preventDefault()
              window.history.back()
            }}
          >
            <ArrowLeft size={18} />
            <span className="truncate max-w-[100px]">{parent.label}</span>
          </LocalizedClientLink>

          <span className="text-gray-400">•</span>

          <span
            className="text-gray-900 font-semibold truncate flex-1"
            aria-current="page"
          >
            {current.label.length > 25 ? `${current.label.slice(0, 22)}...` : current.label}
          </span>
        </nav>
      </div>
    </div>
  )
}
