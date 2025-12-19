"use client"

import Link from "next/link"

export function QuickLinksColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">QUICK LINKS</h4>
      <ul className="space-y-3 text-sm text-gray-600">
        <li><Link href="/quote" className="hover:text-blue-600 transition-colors">Request Quote</Link></li>
        <li><Link href="/compare" className="hover:text-blue-600 transition-colors">Compare Products</Link></li>
        <li><Link href="/products" className="hover:text-blue-600 transition-colors">All Products</Link></li>
        <li><Link href="/saved" className="hover:text-blue-600 transition-colors">Saved Items</Link></li>
        <li><Link href="/bulk-orders" className="hover:text-blue-600 transition-colors">Bulk Orders</Link></li>
      </ul>
    </div>
  )
}
