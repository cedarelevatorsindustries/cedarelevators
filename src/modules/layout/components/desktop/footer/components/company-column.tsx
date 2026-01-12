"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Phone, Mail } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { getStoreSettings } from "@/lib/services/settings"

export function CompanyColumn() {
  const [contactPhone, setContactPhone] = useState<string>("8220202757") // Fallback
  const [contactEmail, setContactEmail] = useState<string>("contact@cedarelevator.com") // Fallback
  const [address, setAddress] = useState({
    line1: "67/37 North Mada Street, Padi,",
    line2: "Chennai - 600050, Tamil Nadu, India"
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await getStoreSettings()
        if (data?.support_phone) {
          setContactPhone(data.support_phone)
        }
        if (data?.support_email) {
          setContactEmail(data.support_email)
        }
        // Build address from database fields
        if (data?.address_line1 || data?.address_line2 || data?.city || data?.state || data?.postal_code) {
          const line1 = data.address_line1 || ""
          const cityStateZip = [data.city, data.state, data.postal_code].filter(Boolean).join(" - ")
          const line2 = [cityStateZip, data.country].filter(Boolean).join(", ")

          setAddress({
            line1: line1 || address.line1,
            line2: line2 || address.line2
          })
        }
      } catch (error) {
        console.error("Failed to fetch store settings for desktop footer", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

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
            <div>{address.line1}</div>
            <div>{address.line2}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Phone size={16} className="text-blue-600" />
          <a href={`tel:${contactPhone.replace(/\D/g, '')}`} className="hover:text-blue-600 transition-colors">
            {contactPhone}
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Mail size={16} className="text-blue-600" />
          <a href={`mailto:${contactEmail}`} className="hover:text-blue-600 transition-colors">
            {contactEmail}
          </a>
        </div>
      </div>
    </div>
  )
}

