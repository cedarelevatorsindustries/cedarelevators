"use client"

import LocalizedClientLink from "@components/ui/localized-client-link"
import { SocialIcons } from "./social-icons"

export function PoliciesSocialColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">POLICIES</h4>
      <ul className="space-y-3 text-sm text-gray-600 mb-8">
        <li><LocalizedClientLink href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/return-policy" className="hover:text-blue-600 transition-colors">Return Policy</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/shipping-policy" className="hover:text-blue-600 transition-colors">Shipping Policy</LocalizedClientLink></li>
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
