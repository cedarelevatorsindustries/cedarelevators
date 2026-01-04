"use client"

import { Mail, Phone } from "lucide-react"

export default function FooterLite() {
  return (
    <footer className="md:hidden bg-blue-50 text-gray-800 pb-20">
      {/* Contact Info - Both on Left Side */}
      <div className="px-4 py-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <a href="tel:+917299012340" className="text-gray-700 hover:text-blue-600">
            7299012340
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <a href="mailto:contact@cedarelevator.com" className="text-gray-700 hover:text-blue-600">
            contact@cedarelevator.com
          </a>
        </div>
      </div>

      {/* Copyright - Single Line */}
      <div className="px-4 py-2 border-t border-blue-100">
        <p className="text-[10px] text-gray-600 text-center leading-tight">
          © 2025 Cedar Elevators Industries. All Rights Reserved. | crafted by <a href="https://mergex.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Mergex</a>
        </p>
      </div>
    </footer>
  )
}

