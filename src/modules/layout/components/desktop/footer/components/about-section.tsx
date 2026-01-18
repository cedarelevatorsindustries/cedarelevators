// Export as default so it can be dynamically imported if needed, though named export is fine too.
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getStoreSettings } from "@/lib/services/settings"
import { StoreSettings } from "@/lib/types/settings"

export function AboutSection() {
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
        console.error("Failed to fetch store settings for footer about section", error)
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
    <div id="about-section" className="hidden md:block bg-gray-50 border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About Cedar Elevators</h3>
            <div className="text-sm text-gray-600 leading-relaxed max-w-4xl">
              {/* Render dynamic content with preserved whitespace */}
              <div
                className={`transition-all duration-300 overflow-hidden relative ${isAboutExpanded ? 'max-h-full' : 'max-h-[80px]'}`}
              >
                <div className="whitespace-pre-wrap">{aboutContent}</div>

                {/* Fade out effect when collapsed */}
                {!isAboutExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
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

