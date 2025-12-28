"use client"

import { FileText, ShoppingBag, RotateCcw } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

export default function PrimaryActionBar() {
  const actions = [
    {
      icon: FileText,
      title: "Start Bulk Quote",
      description: "Custom pricing for large orders",
      href: "/request-quote/bulk",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      icon: ShoppingBag,
      title: "Shop Catalog",
      description: "Browse exclusive products",
      href: "/catalog",
      color: "bg-emerald-600 hover:bg-emerald-700"
    },
    {
      icon: RotateCcw,
      title: "Quick Reorder",
      description: "Reorder past items instantly",
      href: "/profile/orders",
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ]

  return (
    <section className="h-48">
      <div className="flex flex-col gap-3 h-full">
        {actions.map((action, index) => (
          <LocalizedClientLink
            key={index}
            href={action.href}
            className={`${action.color} text-white rounded-lg p-3 transition-all hover:shadow-lg group flex-1`}
          >
            <div className="flex items-start gap-2">
              <div className="bg-white/20 rounded-lg p-2 group-hover:bg-white/30 transition-colors">
                <action.icon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold mb-0.5">{action.title}</h3>
                <p className="text-xs text-white/90">{action.description}</p>
              </div>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
