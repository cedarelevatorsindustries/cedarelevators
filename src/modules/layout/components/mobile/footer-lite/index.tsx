"use client"

import { Mail, Phone } from "lucide-react"
import { useEffect, useState } from "react"
import { getStoreSettings } from "@/lib/services/settings"

export default function FooterLite() {
  const [contactPhone, setContactPhone] = useState<string>("7299012340") // Fallback
  const [contactEmail, setContactEmail] = useState<string>("contact@cedarelevator.com") // Fallback
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
      } catch (error) {
        console.error("Failed to fetch store settings for mobile footer", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return (
    <footer className="md:hidden bg-blue-50 text-gray-800 pb-20">
      {/* Contact Info - Both on Left Side */}
      <div className="px-4 py-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <a href={`tel:+91${contactPhone.replace(/\D/g, '')}`} className="text-gray-700 hover:text-blue-600">
            {contactPhone}
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <a href={`mailto:${contactEmail}`} className="text-gray-700 hover:text-blue-600">
            {contactEmail}
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

