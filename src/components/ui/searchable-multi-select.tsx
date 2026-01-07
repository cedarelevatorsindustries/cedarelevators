"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SearchableMultiSelectProps {
    items: Array<{ id: string; title?: string; name?: string }>
    selectedIds: string[]
    onSelectionChange: (ids: string[]) => void
    placeholder?: string
    emptyMessage?: string
    maxHeight?: string
    hideSelectedBadges?: boolean // Hide the selected items badges
}

export function SearchableMultiSelect({
    items,
    selectedIds,
    onSelectionChange,
    placeholder = "Search...",
    emptyMessage = "No items found",
    hideSelectedBadges = false,
}: SearchableMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const [isMounted, setIsMounted] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputContainerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Track if we're mounted (for SSR)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Update dropdown position when open
    const updatePosition = useCallback(() => {
        if (inputContainerRef.current) {
            const rect = inputContainerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            })
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            updatePosition()
            // Also update on scroll/resize
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
            return () => {
                window.removeEventListener('scroll', updatePosition, true)
                window.removeEventListener('resize', updatePosition)
            }
        }
    }, [isOpen, updatePosition])

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node

            // Check if click is inside the container
            if (containerRef.current?.contains(target)) {
                return
            }

            // Check if click is inside the portal dropdown
            if (dropdownRef.current?.contains(target)) {
                return
            }

            setIsOpen(false)
            setSearchQuery('')
        }

        // Use capture phase to catch events before they bubble
        document.addEventListener('mousedown', handleClickOutside, true)
        return () => document.removeEventListener('mousedown', handleClickOutside, true)
    }, [isOpen])

    const selectedItems = items.filter(item => selectedIds.includes(item.id))
    const unselectedItems = items.filter(item => !selectedIds.includes(item.id))

    const filteredItems = unselectedItems.filter(item => {
        const searchTerm = searchQuery.toLowerCase()
        const itemName = (item.title || item.name || '').toLowerCase()
        return itemName.includes(searchTerm)
    })

    const handleSelect = useCallback((id: string) => {
        onSelectionChange([...selectedIds, id])
        setSearchQuery('')
        // Keep dropdown open for multi-select
        inputRef.current?.focus()
    }, [selectedIds, onSelectionChange])

    const handleRemove = useCallback((id: string) => {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
    }, [selectedIds, onSelectionChange])

    const handleInputClick = () => {
        setIsOpen(true)
        updatePosition()
    }

    // Render dropdown menu
    const renderDropdown = () => {
        if (!isOpen || !isMounted) return null

        const dropdownContent = (
            <div
                ref={dropdownRef}
                className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
                style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    zIndex: 99999,
                    maxHeight: '240px'
                }}
            >
                <div className="overflow-y-auto max-h-60">
                    {filteredItems.length === 0 ? (
                        <div className="px-3 py-8 text-center text-sm text-gray-500">
                            {searchQuery ? `No results for "${searchQuery}"` : emptyMessage}
                        </div>
                    ) : (
                        <div className="py-1">
                            {filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleSelect(item.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            handleSelect(item.id)
                                        }
                                    }}
                                    className="w-full text-left px-3 py-2.5 text-sm text-gray-900 hover:bg-orange-50 active:bg-orange-100 transition-colors flex items-center justify-between cursor-pointer select-none"
                                >
                                    <span>{item.title || item.name}</span>
                                    <Check className="h-4 w-4 text-orange-500 opacity-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )

        return createPortal(dropdownContent, document.body)
    }

    return (
        <div ref={containerRef} className="space-y-3">
            {/* Selected Items as Badges */}
            {!hideSelectedBadges && selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedItems.map(item => (
                        <Badge
                            key={item.id}
                            variant="secondary"
                            className="bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200 pl-3 pr-1 py-1.5"
                        >
                            <span className="mr-2">{item.title || item.name}</span>
                            <button
                                onClick={() => handleRemove(item.id)}
                                className="hover:bg-orange-300 rounded-full p-0.5 transition-colors"
                                type="button"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className="relative" ref={inputContainerRef}>
                <div
                    className={cn(
                        "flex items-center gap-2 border rounded-lg px-3 py-2 bg-white transition-all cursor-pointer",
                        isOpen ? "border-orange-400 ring-2 ring-orange-500/20" : "border-gray-200 hover:border-orange-300"
                    )}
                    onClick={handleInputClick}
                >
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleInputClick}
                        className="flex-1 outline-none text-sm bg-transparent"
                        autoComplete="off"
                    />
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 text-gray-400 transition-transform shrink-0",
                            isOpen && "rotate-180"
                        )}
                    />
                </div>

                {/* Dropdown Menu via Portal */}
                {renderDropdown()}
            </div>

            {/* Helper Text */}
            {selectedItems.length === 0 && (
                <p className="text-xs text-gray-500">
                    Click to search and select items
                </p>
            )}
        </div>
    )
}
