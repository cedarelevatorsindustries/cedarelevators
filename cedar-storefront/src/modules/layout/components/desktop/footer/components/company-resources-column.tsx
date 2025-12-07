"use client"

import { Download } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

export function CompanyResourcesColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">COMPANY</h4>
      <ul className="space-y-3 text-sm text-gray-600 mb-6">
        <li><LocalizedClientLink href="/about" className="hover:text-blue-600 transition-colors">About Us</LocalizedClientLink></li>
        <li><LocalizedClientLink href="/why-choose" className="hover:text-blue-600 transition-colors">Why Choose Cedar</LocalizedClientLink></li>
      </ul>
      
      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-6">RESOURCES</h4>
        <ul className="space-y-3 text-sm text-gray-600">
          <li>
            <LocalizedClientLink href="/manuals" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <Download size={14} />
              Product Manuals
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/installation-guides" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <Download size={14} />
              Installation Guides
            </LocalizedClientLink>
          </li>
          <li><LocalizedClientLink href="/faqs" className="hover:text-blue-600 transition-colors">FAQs</LocalizedClientLink></li>
        </ul>
      </div>
    </div>
  )
}
