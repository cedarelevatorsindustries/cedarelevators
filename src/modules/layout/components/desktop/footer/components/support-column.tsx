"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"

export function SupportColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">SUPPORT</h4>
      <ul className="space-y-3 text-sm text-gray-600">
        <li><LocalizedClientLink href="/help" className="hover:text-blue-600 transition-colors">Help Center</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/track" className="hover:text-blue-600 transition-colors">Track Order</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/shipping" className="hover:text-blue-600 transition-colors">Shipping Information</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/returns" className="hover:text-blue-600 transition-colors">Returns & Refunds</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/installation" className="hover:text-blue-600 transition-colors">Installation Services</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/warranty" className="hover:text-blue-600 transition-colors">Warranty Information</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/bulk-orders" className="hover:text-blue-600 transition-colors">Bulk Order Inquiry</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</LocalizedClientLink></li>
      </ul>
    </div>
  )
}
