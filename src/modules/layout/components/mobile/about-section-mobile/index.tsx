"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function AboutSectionMobile() {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  const pathname = usePathname()



  return (
    <div className="md:hidden bg-gray-50 border-t border-gray-200">
      <div className="px-4 py-4">
        <button
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          className="w-full flex items-center justify-between"
          aria-label={isAboutExpanded ? "Collapse about section" : "Expand about section"}
        >
          <h3 className="text-base font-semibold text-gray-900">About Cedar Elevators</h3>
          {isAboutExpanded ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </button>

        {isAboutExpanded && (
          <div className="mt-3 text-xs text-gray-600 leading-relaxed space-y-2">
            <p>
              Founded in 2010, <strong>Cedar Elevators</strong> is the leading B2B e-commerce platform for premium elevator components in India.
            </p>
            <p>
              Cedar Elevators offers AI-powered B2B sourcing solutions, from product and supplier search, online order placement, payment, inspection, logistics services, to after-sales support, providing worldwide business buyers with a more simplified, efficient, professional, and secure sourcing process to grow and succeed.
            </p>
            <p>
              <strong>Cedar Elevators</strong> also digitalizes cross-border trading solutions, from online storefront building to order management, marketing promotion, payment, fulfillment, and beyond, offering global suppliers a seamless and end-to-end approach to partnering with businesses worldwide.
            </p>
            <p>
              In today's complex and rapidly evolving business landscape, <strong>Cedar Elevators</strong> remains committed to supporting the growth of global small and medium-sized businesses, empowering them to transform through digital trade, seize new opportunities, and accelerate business growth internationally.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

