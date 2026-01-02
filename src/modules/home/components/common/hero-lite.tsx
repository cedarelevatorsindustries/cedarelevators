"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProductCategory } from "@/lib/types/domain"
import { Search } from "lucide-react"

type HeroLiteProps = {
  userType: "individual" | "business" | "verified"
  categories?: ProductCategory[]
  popularSearchTerms?: string[]
}

const searchPlaceholders = [
  "Search elevator motors...",
  "Search control panels...",
  "Search door operators...",
  "Search safety sensors...",
  "Search guide rails...",
  "Search ARD systems...",
  "Search limit switches..."
]

export default function HeroLite({ userType, categories = [], popularSearchTerms = [] }: HeroLiteProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "business-hub">("products")
  const [searchValue, setSearchValue] = useState("")
  const [currentPlaceholder, setCurrentPlaceholder] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)

  // Define tabs based on user type (verified treated same as business)
  const tabs = (userType === "business" || userType === "verified")
    ? [
      { id: "products" as const, label: "Products" },
      { id: "categories" as const, label: "Categories" },
      { id: "business-hub" as const, label: "Business Hub" },
    ]
    : [
      { id: "products" as const, label: "Products" },
      { id: "categories" as const, label: "Categories" },
    ]


  // Animated placeholder effect
  useEffect(() => {
    if (isFocused || searchValue) return

    const currentText = searchPlaceholders[currentIndex]

    if (isTyping) {
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(currentText.slice(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, 100)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(currentText.slice(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, 50)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setCurrentIndex((currentIndex + 1) % searchPlaceholders.length)
          setIsTyping(true)
        }, 500)
        return () => clearTimeout(timeout)
      }
    }
  }, [currentIndex, charIndex, isTyping, isFocused, searchValue])

  const handleTabClick = (tabId: "products" | "categories" | "business-hub") => {
    setActiveTab(tabId)
    // Dispatch custom event to notify parent component
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("heroTabChange", { detail: { tab: tabId } }))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!searchValue) {
      setCurrentIndex(0)
      setCharIndex(0)
      setIsTyping(true)
      setCurrentPlaceholder("")
    }
  }

  // Get background color based on active tab
  const getBgColor = () => {
    if (activeTab === "categories") return "from-[#2074bc] via-[#2074bc] to-[#1a5fa0]"
    if (activeTab === "business-hub") return "from-[#0D4A3F] via-[#0D4A3F] to-[#0D4A3F]"
    return "from-orange-500 via-orange-500 to-orange-400"
  }

  return (
    <div className={`relative bg-gradient-to-b ${getBgColor()} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center items-center mb-6 mt-4">
          <div className="inline-flex bg-transparent gap-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 text-xl font-bold transition-all text-center relative ${activeTab === tab.id
                  ? "text-white"
                  : "text-white/70 hover:text-white/90"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar - Hero variant with typing animation */}
        <div className="max-w-5xl mx-auto mb-5">
          <div className="bg-white rounded-xl shadow-lg p-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={isFocused || searchValue ? "Search..." : currentPlaceholder}
                className="w-full h-12 px-4 pr-32 text-base bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-0 placeholder:text-gray-500"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Search size={18} />
                <span className="font-medium">Search</span>
              </button>
            </form>
          </div>
        </div>

        {/* Frequently Searched - Show only if there are search terms */}
        {popularSearchTerms.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start gap-3 flex-wrap">
              <span className="text-white font-normal text-sm whitespace-nowrap">
                Frequently searched:
              </span>
              <div className="flex flex-wrap gap-3">
                {popularSearchTerms.map((item) => (
                  <a
                    key={item}
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="text-white/95 hover:text-white text-sm underline hover:no-underline transition-all"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
