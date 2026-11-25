'use client'

import React, { useState } from 'react'
import { Search, Loader2, ChevronDown, Check } from 'lucide-react'

interface QuoteSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; sku?: string }[]
  placeholder: string
  error?: any
  onSearch?: (query: string) => void
  isLoading?: boolean
  id?: string
}

export function QuoteSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
  onSearch,
  isLoading,
  id,
}: QuoteSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = searchQuery
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        className={`w-full min-h-[42px] px-3.5 py-2.5 bg-white border ${
          error ? 'border-red-400' : 'border-gray-300'
        } rounded-lg text-left text-sm flex items-center justify-between focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none`}
      >
        <span className={selectedOption ? 'text-gray-900 truncate' : 'text-gray-400 truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
            {onSearch && (
              <div className="p-2.5 border-b border-gray-100 bg-gray-50/70">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      onSearch(e.target.value)
                    }}
                    placeholder="Search products by name or SKU..."
                    className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value)
                        setIsOpen(false)
                        setSearchQuery('')
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                        isSelected
                          ? 'bg-orange-50 text-orange-900'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                    </button>
                  )
                })
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  {isLoading ? 'Searching catalog...' : 'No matching products found'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
