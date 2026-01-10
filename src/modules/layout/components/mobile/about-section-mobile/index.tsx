"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getStoreSettings } from "@/lib/services/settings"

export default function AboutSectionMobile() {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  const [aboutContent, setAboutContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await getStoreSettings()
        if (data?.about_cedar) {
          setAboutContent(data.about_cedar)
        }
      } catch (error) {
        console.error("Failed to fetch store settings for mobile about section", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Don't show About section on profile pages
  if (pathname?.startsWith('/profile')) {
    return null
  }

  // If no content is found, don't render the section
  if (!isLoading && !aboutContent) {
    return null
  }

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
          <div className="mt-3 text-xs text-gray-600 leading-relaxed">
            <div className="whitespace-pre-wrap">{aboutContent}</div>
          </div>
        )}
      </div>
    </div>
  )
}

