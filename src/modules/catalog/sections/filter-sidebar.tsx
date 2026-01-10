"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"

interface FilterSidebarProps {
  onFilterChange?: (filters: any) => void
  filterType?: 'full' | 'category-specific' | 'cross-category'
  availableFilters?: string[]
  preAppliedFilters?: Record<string, string[]>
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    category: true,
    availability: true,
    grade: false,
    dimensions: false,
    finish: false,
    offers: false,
  })

  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    )
  }

  const removeFilter = (filter: string) => {
    setSelectedFilters((prev) => prev.filter((f) => f !== filter))
  }

  const clearAllFilters = () => {
    setSelectedFilters([])
    setPriceRange({ min: 0, max: 50000 })
  }

  return (
    <aside className="w-full lg:w-80 sticky top-24 self-start">
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Filters</h3>

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                Active Filters
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1 bg-white border border-gray-300 rounded-full px-3 py-1 text-sm"
                >
                  {filter}
                  <button
                    onClick={() => removeFilter(filter)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Sort Filter */}
          <div>
            <button
              onClick={() => toggleSection("sort")}
              className="flex items-center justify-between w-full mb-4"
            >
              <h4 className="font-semibold text-gray-900">Sort By</h4>
              {expandedSections.sort ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.sort && (
              <div className="space-y-3">
                {[
                  { value: "default", label: "Recommended" },
                  { value: "price_asc", label: "Price: Low to High" },
                  { value: "price_desc", label: "Price: High to Low" },
                  { value: "newest", label: "Newest First" },
                  { value: "popularity", label: "Most Popular" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Category Filter */}
          <div>
            <button
              onClick={() => toggleSection("category")}
              className="flex items-center justify-between w-full mb-4"
            >
              <h4 className="font-semibold text-gray-900">Categories</h4>
              {expandedSections.category ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.category && (
              <div className="space-y-3">
                {[
                  { name: "Cedar Decking", count: 156 },
                  { name: "Cedar Siding", count: 98 },
                  { name: "Cedar Fencing", count: 72 },
                  { name: "Cedar Posts", count: 45 },
                  { name: "Cedar Trim", count: 34 },
                ].map((category) => (
                  <label
                    key={category.name}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(category.name)}
                      onChange={() => handleFilterToggle(category.name)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                      {category.name}
                      <span className="text-gray-500 ml-1">({category.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Availability Filter */}
          <div>
            <button
              onClick={() => toggleSection("availability")}
              className="flex items-center justify-between w-full mb-4"
            >
              <h4 className="font-semibold text-gray-900">Availability</h4>
              {expandedSections.availability ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.availability && (
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes("In Stock")}
                    onChange={() => handleFilterToggle("In Stock")}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                    In Stock <span className="text-gray-500">(342)</span>
                  </span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes("Out of Stock")}
                    onChange={() => handleFilterToggle("Out of Stock")}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                    Out of Stock <span className="text-gray-500">(28)</span>
                  </span>
                </label>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Grade/Quality Filter */}
          <div>
            <button
              onClick={() => toggleSection("grade")}
              className="flex items-center justify-between w-full mb-4"
            >
              <h4 className="font-semibold text-gray-900">Grade/Quality</h4>
              {expandedSections.grade ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.grade && (
              <div className="space-y-3">
                {[
                  { name: "Clear Grade", count: 156 },
                  { name: "Select Grade", count: 98 },
                  { name: "Premium Grade", count: 72 },
                ].map((grade) => (
                  <label
                    key={grade.name}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(grade.name)}
                      onChange={() => handleFilterToggle(grade.name)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                      {grade.name}
                      <span className="text-gray-500 ml-1">({grade.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Special Offers */}
          <div>
            <button
              onClick={() => toggleSection("offers")}
              className="flex items-center justify-between w-full mb-4"
            >
              <h4 className="font-semibold text-gray-900">Special Offers</h4>
              {expandedSections.offers ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.offers && (
              <div className="space-y-3">
                {[
                  { name: "On Sale", count: 67 },
                  { name: "New Arrivals", count: 23 },
                  { name: "Best Sellers", count: 45 },
                ].map((offer) => (
                  <label
                    key={offer.name}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(offer.name)}
                      onChange={() => handleFilterToggle(offer.name)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                      {offer.name}
                      <span className="text-gray-500 ml-1">({offer.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Apply Filters Button */}
        <button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors">
          Apply Filters
        </button>

        {/* Promotional Banner */}
        <div className="mt-6 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg p-6 border border-orange-200">
          <h4 className="font-bold text-gray-900 mb-2">Get Exclusive Offers</h4>
          <p className="text-sm text-gray-700 mb-4">
            Sign up for your first order discount
          </p>
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
            Sign Up
          </button>
        </div>
      </div>
    </aside>
  )
}

