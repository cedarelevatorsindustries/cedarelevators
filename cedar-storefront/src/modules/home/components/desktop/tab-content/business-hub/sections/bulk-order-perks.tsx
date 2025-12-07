"use client"

import { Truck, Tag, Clock } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

export default function BulkOrderPerks() {
  const perks = [
    {
      icon: Tag,
      text: "Up to 28% off on orders >₹10L"
    },
    {
      icon: Truck,
      text: "Priority delivery & installation"
    },
    {
      icon: Clock,
      text: "Dedicated account manager"
    }
  ]

  return (
    <section>
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              🎉 Bulk Order Perks – Extra 5% off on large orders over ₹10 Lakhs!
            </h3>
            <div className="flex flex-wrap gap-6">
              {perks.map((perk, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <perk.icon size={16} className="text-orange-600" />
                  <span>{perk.text}</span>
                </div>
              ))}
            </div>
          </div>
          <LocalizedClientLink
            href="/business/bulk-pricing"
            className="ml-6 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            Learn More
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
