"use client"

import Link from "next/link"

interface SupportColumnProps {
  isAuthenticated?: boolean
}

export function SupportColumn({ isAuthenticated = false }: SupportColumnProps) {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">SUPPORT</h4>
      <ul className="space-y-3 text-sm text-gray-600">
        {isAuthenticated && (
          <li><Link href="/profile/orders" className="hover:text-blue-600 transition-colors">Track Order</Link></li>
        )}

        <li><Link href="/returns" className="hover:text-blue-600 transition-colors">Returns & Refunds</Link></li>
        <li><Link href="/warranty" className="hover:text-blue-600 transition-colors">Warranty Information</Link></li>
        <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
      </ul>
    </div>
  )
}

