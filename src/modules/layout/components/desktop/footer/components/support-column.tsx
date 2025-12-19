"use client"

import Link from "next/link"

export function SupportColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">SUPPORT</h4>
      <ul className="space-y-3 text-sm text-gray-600">
        <li><Link href="/help" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
        <li><Link href="/track" className="hover:text-blue-600 transition-colors">Track Order</Link></li>
        <li><Link href="/shipping" className="hover:text-blue-600 transition-colors">Shipping Information</Link></li>
        <li><Link href="/returns" className="hover:text-blue-600 transition-colors">Returns & Refunds</Link></li>
        <li><Link href="/installation" className="hover:text-blue-600 transition-colors">Installation Services</Link></li>
        <li><Link href="/warranty" className="hover:text-blue-600 transition-colors">Warranty Information</Link></li>
        <li><Link href="/bulk-orders" className="hover:text-blue-600 transition-colors">Bulk Order Inquiry</Link></li>
        <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
      </ul>
    </div>
  )
}
