"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, ChevronUp } from "lucide-react"
import { getStoreSettings } from "@/lib/services/settings"
import { SocialIcons } from "./components/social-icons"

interface FooterProps {
  isAuthenticated?: boolean
}

export default function Footer({ isAuthenticated = false }: FooterProps) {
  const [contactPhone, setContactPhone] = useState<string>("+91 8220202757")
  const [contactEmail, setContactEmail] = useState<string>("support@cedarelevators.in")
  const [address, setAddress] = useState({
    line1: "67/37, N Mada St, Padi",
    line2: "Chennai - Tamil Nadu - 600050, India"
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await getStoreSettings()
        if (data?.support_phone) {
          setContactPhone(data.support_phone)
        }
        if (data?.support_email) {
          // Ensure domain is cedarelevators.in
          const email = data.support_email.replace("@cedarelevator.com", "@cedarelevators.in")
          setContactEmail(email)
        }
        if (data?.address_line1 || data?.address_line2 || data?.city || data?.state || data?.postal_code) {
          const line1 = data.address_line1 || address.line1
          const cityStateZip = [data.city, data.state, data.postal_code].filter(Boolean).join(" - ")
          const line2 = [cityStateZip, data.country].filter(Boolean).join(", ")
          setAddress({ line1, line2 })
        }
      } catch (error) {
        console.error("Failed to fetch store settings for footer", error)
      }
    }

    fetchSettings()
  }, [])

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <footer className="w-full bg-white border-t border-gray-200 text-gray-900 pb-20 md:pb-0">
      {/* Main Footer Content - Balanced 4-Column Full-Width Layout */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Logo & Company Description */}
          <div className="flex flex-col">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo/cedarelevators.png"
                alt="Cedar Elevators Industries"
                width={160}
                height={67}
                className="h-20 w-auto object-contain"
              />
            </Link>

            <p className="text-gray-800 text-base mb-3 leading-relaxed font-bold italic">
              Premium lift components for every project
            </p>

            <p className="text-gray-600 text-sm leading-relaxed">
              Cedar Elevators Industries provides precision-engineered elevator components and vertical transportation solutions for modern infrastructure.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-900 mb-6 text-sm tracking-wider uppercase">
              EXPLORE
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/products" className="hover:text-blue-600 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-blue-600 transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/#applications" className="hover:text-blue-600 transition-colors">
                  Shop by Application
                </Link>
              </li>
              <li>
                <Link href="/#elevator-types" className="hover:text-blue-600 transition-colors">
                  Shop by Elevator Type
                </Link>
              </li>
              <li>
                <Link href="/#featured-products" className="hover:text-blue-600 transition-colors">
                  Featured Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Support */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-900 mb-6 text-sm tracking-wider uppercase">
              COMPANY & SUPPORT
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/#about-section" className="hover:text-blue-600 transition-colors">
                  About Cedar
                </Link>
              </li>
              <li>
                <Link href="/why-choose" className="hover:text-blue-600 transition-colors">
                  Why Choose Cedar
                </Link>
              </li>
              <li>
                <Link href="/quotes/new" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information & Follow Us (Right Side) */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-900 mb-6 text-sm tracking-wider uppercase">
              CONTACT US
            </h4>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="leading-snug">
                  <div>{address.line1}</div>
                  <div>{address.line2}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={18} className="text-blue-600 flex-shrink-0" />
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  {contactPhone}
                </a>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={18} className="text-blue-600 flex-shrink-0" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {contactEmail}
                </a>
              </div>
            </div>

            {/* Follow Us / Social Icons */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5 text-sm tracking-wider uppercase">
                FOLLOW US
              </h4>
              <p className="text-sm text-gray-600 mb-3">Stay connected with us</p>
              <SocialIcons />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar - Classic Style */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright Notice */}
            <div className="text-sm text-gray-700">
              © 2026 Cedar Elevators Industries. All Rights Reserved.
            </div>

            {/* Right: Back to Top + Credit */}
            <div className="flex items-center gap-4">
              <button
                onClick={scrollToTop}
                className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                aria-label="Back to top"
              >
                <ChevronUp size={20} />
              </button>

              <div className="text-sm text-gray-700">
                Crafted by{" "}
                <a
                  href="https://mergex.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Mergex
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
