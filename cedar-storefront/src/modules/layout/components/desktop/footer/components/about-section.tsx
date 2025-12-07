"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"

export function AboutSection() {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  const pathname = usePathname()
  
  // Don't show About section on profile pages
  if (pathname?.startsWith('/profile')) {
    return null
  }

  return (
    <div className="hidden md:block bg-gray-50 border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About Cedar Elevators</h3>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="mb-1">
                Founded in 2010, <strong>Cedar Elevators</strong> is the leading B2B e-commerce platform for premium elevator components in India.
              </p>
              <p>
                Cedar Elevators offers AI-powered B2B sourcing solutions, from product and supplier search, online order placement, payment, inspection, logistics services, to after-sales support, providing worldwide business buyers with a more simplified, efficient, professional, and secure sourcing process to grow and succeed.
              </p>
              
              {isAboutExpanded && (
                <div className="mt-4 space-y-3">
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
          
          <button
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            aria-label={isAboutExpanded ? "Collapse about section" : "Expand about section"}
          >
            {isAboutExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
