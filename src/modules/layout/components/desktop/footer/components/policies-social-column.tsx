"use client"

import Link from "next/link"
import { SocialIcons } from "./social-icons"

export function PoliciesSocialColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">POLICIES</h4>
      <ul className="space-y-3 text-sm text-gray-600 mb-8">
        <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
        <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link></li>
        <li><Link href="/return-policy" className="hover:text-blue-600 transition-colors">Return Policy</Link></li>
        <li><Link href="/shipping-policy" className="hover:text-blue-600 transition-colors">Shipping Policy</Link></li>
      </ul>
      
      {/* Follow Us Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">FOLLOW US</h4>
        <p className="text-sm text-gray-600 mb-4">Stay connected with us</p>
        <SocialIcons />
      </div>
    </div>
  )
}
