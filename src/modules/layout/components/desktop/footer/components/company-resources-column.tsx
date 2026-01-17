"use client"

import { Download } from "lucide-react"
import Link from "next/link"

export function CompanyResourcesColumn() {
  return (
    <div className="col-span-2">
      <h4 className="font-semibold text-gray-900 mb-6">COMPANY</h4>
      <ul className="space-y-3 text-sm text-gray-600 mb-6">
        <li><Link href="/why-choose" className="hover:text-blue-600 transition-colors">Why Choose Cedar</Link></li>
        <li><Link href="/warranty" className="hover:text-blue-600 transition-colors">Warranty Information</Link></li>
        <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
      </ul>

    </div>
  )
}

