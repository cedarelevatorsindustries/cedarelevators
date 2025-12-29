"use client"

import Link from "next/link"
import { CircleHelp, Phone, MessageCircle } from "lucide-react"

interface HelpSectionProps {
  variant?: "mobile" | "desktop"
  title?: string
  description?: string
  showWhatsApp?: boolean
  className?: string
}

export default function HelpSection({
  variant = "mobile",
  title = "Need Help?",
  description,
  showWhatsApp = true,
  className = ""
}: HelpSectionProps) {
  const isMobile = variant === "mobile"

  const helpLinks = [
    {
      href: "/help",
      icon: CircleHelp,
      label: "Help & FAQ",
      description: "Find answers to common questions",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      href: "tel:+911234567890",
      icon: Phone,
      label: "Call Sales Team",
      description: "Speak with our experts",
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100"
    },
    ...(showWhatsApp ? [{
      href: "https://wa.me/911234567890",
      icon: MessageCircle,
      label: "WhatsApp Support",
      description: "Chat with us instantly",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      hoverColor: "hover:bg-emerald-100"
    }] : [])
  ]

  if (isMobile) {
    return (
      <div className={`mx-4 mt-6 bg-white rounded-xl p-4 border border-gray-200 ${className}`}>
        <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mb-3">{description}</p>
        )}
        <div className="space-y-2">
          {helpLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between p-3 ${link.bgColor} rounded-lg ${link.hoverColor} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <link.icon className={link.color} size={20} />
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // Desktop variant
  return (
    <div className={`bg-gray-50 rounded-lg p-6 border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {helpLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center p-4 bg-white border border-gray-300 rounded-lg ${link.hoverColor} transition-all hover:shadow-md group`}
          >
            <div className={`${link.bgColor} ${link.color} w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <link.icon size={24} />
            </div>
            <span className="text-sm font-medium text-gray-900 mb-1">{link.label}</span>
            <span className="text-xs text-gray-600 text-center">{link.description}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
