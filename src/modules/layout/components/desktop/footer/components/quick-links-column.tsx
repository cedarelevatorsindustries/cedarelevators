"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"

export function QuickLinksColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">QUICK LINKS</h4>
      <ul className="space-y-3 text-sm text-gray-600">
        <li><LocalizedClientLink href="/quote" className="hover:text-blue-600 transition-colors">Request Quote</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/compare" className="hover:text-blue-600 transition-colors">Compare Products</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/products" className="hover:text-blue-600 transition-colors">All Products</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/saved" className="hover:text-blue-600 transition-colors">Saved Items</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/bulk-orders" className="hover:text-blue-600 transition-colors">Bulk Orders</LocalizedClientLink></li>
      </ul>
    </div>
  )
}
