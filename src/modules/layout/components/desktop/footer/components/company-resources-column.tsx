"use client"

import { Download } from "lucide-react"
import Link from "next/link"

export function CompanyResourcesColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">COMPANY</h4>
      <ul className="space-y-3 text-sm text-gray-600 mb-6">
        <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
        <li><Link href="/why-choose" className="hover:text-blue-600 transition-colors">Why Choose Cedar</Link></li>
      </ul>
      
      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-6">RESOURCES</h4>
        <ul className="space-y-3 text-sm text-gray-600">
          <li>
            <Link href="/manuals" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <Download size={14} />
              Product Manuals
            </Link>
          </li>
          <li>
            <Link href="/installation-guides" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <Download size={14} />
              Installation Guides
            </Link>
          </li>
          <li><Link href="/faqs" className="hover:text-blue-600 transition-colors">FAQs</Link></li>
        </ul>
      </div>
    </div>
  )
}
