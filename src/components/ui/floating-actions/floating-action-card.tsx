"use client"

import { useState, useEffect } from "react"
import { ArrowUp, CircleHelp } from "lucide-react"
import { usePathname } from "next/navigation"

interface FloatingActionCardProps {
  whatsappNumber?: string
  showSurvey?: boolean
  surveyUrl?: string
}

export function FloatingActionCard({
  whatsappNumber = "+919876543210",
  showSurvey = false,
  surveyUrl = "/survey"
}: FloatingActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const pathname = usePathname()

  // Show back to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const openWhatsApp = () => {
    const message = encodeURIComponent("Hi, I'm interested in your elevator products.")
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  // Check if mobile view
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check if we should show WhatsApp on mobile (only on homepage and catalog)
  const shouldShowWhatsAppOnMobile = pathname === '/' || pathname?.startsWith('/catalog')
  const showWhatsApp = !isMobile || shouldShowWhatsAppOnMobile

  return (
    <div
      className="fixed right-0 bottom-20 z-50 flex flex-col items-end"
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
    >
      {/* Main Card - Expands on Hover (Desktop Only) */}
      <div
        className={`bg-white rounded-l-2xl shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isExpanded && !isMobile ? 'w-48' : 'w-14'
          }`}
      >
        <div className={`${isExpanded && !isMobile ? 'p-3' : 'p-2'}`}>
          {/* WhatsApp Button */}
          {showWhatsApp && (
            <div className={`flex items-center ${isExpanded && !isMobile ? 'gap-3 mb-2' : 'mb-0 justify-center'}`}>
              <button
                onClick={openWhatsApp}
                className={`flex-shrink-0 ${isExpanded && !isMobile ? 'w-10 h-10' : 'w-10 h-10'} bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full flex items-center justify-center transition-all shadow-md`}
                aria-label="Contact us on WhatsApp"
              >
                {/* Official WhatsApp Icon SVG */}
                <svg
                  viewBox="0 0 24 24"
                  className={`${isExpanded && !isMobile ? 'w-6 h-6' : 'w-6 h-6'}`}
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </button>
              {isExpanded && !isMobile && (
                <div className="flex-1 animate-fadeIn">
                  <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-xs text-gray-600">Chat with us</p>
                </div>
              )}
            </div>
          )}

          {/* Survey Button (Optional) */}
          {showSurvey && (
            <>
              <div className="border-t border-gray-200 my-2" />
              <div className={`flex items-center ${isExpanded && !isMobile ? 'gap-3 mb-2' : 'mb-0 justify-center'}`}>
                <button
                  onClick={() => window.open(surveyUrl, '_blank')}
                  className={`flex-shrink-0 ${isExpanded && !isMobile ? 'w-10 h-10' : 'w-10 h-10'} bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-colors`}
                  aria-label="Take survey"
                >
                  <CircleHelp className="w-5 h-5" />
                </button>
                {isExpanded && !isMobile && (
                  <div className="flex-1 animate-fadeIn">
                    <p className="text-sm font-semibold text-gray-900">Survey</p>
                    <p className="text-xs text-gray-600">Share feedback</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Back to Top Button */}
          {showBackToTop && (
            <>
              <div className="border-t border-gray-200 my-2" />
              <div className={`flex items-center ${isExpanded && !isMobile ? 'gap-3' : 'justify-center'}`}>
                <button
                  onClick={scrollToTop}
                  className={`flex-shrink-0 ${isExpanded && !isMobile ? 'w-10 h-10' : 'w-10 h-10'} bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-colors`}
                  aria-label="Back to top"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                {isExpanded && !isMobile && (
                  <div className="flex-1 animate-fadeIn">
                    <p className="text-sm font-semibold text-gray-900">Back to top</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Simplified version - Just WhatsApp and Back to Top
export function SimpleFloatingActions({
  whatsappNumber = "+919876543210"
}: { whatsappNumber?: string }) {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const openWhatsApp = () => {
    const message = encodeURIComponent("Hi, I'm interested in your elevator products.")
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  return (
    <div className="fixed right-0 bottom-6 z-50 flex flex-col gap-3 pr-4">
      {/* WhatsApp Button */}
      <button
        onClick={openWhatsApp}
        className="group relative w-12 h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-110"
        aria-label="Contact us on WhatsApp"
      >
        {/* Official WhatsApp Icon SVG */}
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>

        {/* Tooltip on Hover */}
        <span className="absolute right-14 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat on WhatsApp
        </span>
      </button>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="group relative w-12 h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-110 border border-gray-200"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />

          {/* Tooltip on Hover */}
          <span className="absolute right-14 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Back to top
          </span>
        </button>
      )}
    </div>
  )
}

