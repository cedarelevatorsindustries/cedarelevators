"use client"

import { MessageCircle, Phone, CircleHelp } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

const helpOptions = [
  {
    icon: MessageCircle,
    label: "Live Chat",
    href: "/chat"
  },
  {
    icon: Phone,
    label: "Call Us",
    href: "/contact"
  },
  {
    icon: CircleHelp,
    label: "FAQ",
    href: "/faq"
  }
]

export default function NeedHelpSection() {
  return (
    <div className="px-4 pt-8 pb-8 bg-white">
      <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em] pb-3 text-center">
        NEED HELP?
      </h3>
      <div className="flex gap-3 justify-center">
        {helpOptions.map((option, index) => (
          <LocalizedClientLink
            key={index}
            href={option.href}
            className="flex flex-col items-center gap-2 min-w-24 rounded-lg bg-gray-50 p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <option.icon className="text-3xl text-primary" size={32} />
            <span className="text-sm font-medium text-gray-900">
              {option.label}
            </span>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

