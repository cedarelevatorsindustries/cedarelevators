"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function HeroLiteMobile() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <div className="bg-gradient-to-b from-orange-500 to-orange-400 py-8 px-4 -mt-14 pt-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Find Your Elevator Parts
        </h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products..."
            className="w-full h-12 px-4 pr-12 text-base bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white p-2 rounded-lg transition-colors"
          >
            <Search size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}

