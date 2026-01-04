"use client"

import Image from "next/image"
import { MapPin, Phone, Mail } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

export function CompanyColumn() {
  return (
    <div className="col-span-4">
      <LocalizedClientLink href="/" className="inline-block mb-4">
        <Image
          src="/logo/cedarelevators.png"
          alt="Cedar Elevators Industries"
          width={160}
          height={67}
          className="h-24 w-auto"
        />
      </LocalizedClientLink>

      <p className="text-gray-600 text-base mb-6 leading-relaxed font-bold italic">
        Premium lift components for every project
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <div>67/37 North Mada Street, Padi,</div>
            <div>Chennai - 600050, Tamil Nadu, India</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Phone size={16} className="text-blue-600" />
          <a href="tel:8220202757" className="hover:text-blue-600 transition-colors">8220202757</a>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Mail size={16} className="text-blue-600" />
          <a href="mailto:contact@cedarelevator.com" className="hover:text-blue-600 transition-colors">
            contact@cedarelevator.com
          </a>
        </div>
      </div>
    </div>
  )
}

