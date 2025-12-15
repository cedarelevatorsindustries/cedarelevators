"use client"

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  message?: string
  phoneNumber?: string
  floating?: boolean
  label?: string
}

export default function WhatsAppButton({
  message = 'Hi, I need help with my order on Cedar Elevators',
  phoneNumber = '919876543210',
  floating = false,
  label = 'Need Help?',
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  if (floating) {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 
          bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 
          transition-all hover:scale-105 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          {label}
        </span>
      </a>
    )
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white 
        rounded-lg font-medium hover:bg-green-600 transition-colors"
    >
      <MessageCircle className="w-5 h-5" />
      {label}
    </a>
  )
}
