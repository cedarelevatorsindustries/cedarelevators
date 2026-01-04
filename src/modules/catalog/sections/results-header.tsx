"use client"

import { Grid, List, ChevronDown } from "lucide-react"
import { useState } from "react"

interface ResultsHeaderProps {
  totalProducts: number
  filteredProducts?: number
  currentView: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
  onSortChange?: (sort: string) => void
  onPerPageChange?: (perPage: number) => void
  currentPage?: number
  activeFiltersCount?: number
}

const sortOptions = [
  { value: "best-selling", label: "Best Selling" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "a-z", label: "A-Z" },
]

export default function ResultsHeader({
  totalProducts,
  filteredProducts,
  currentView,
  onViewChange,
  onSortChange,
  onPerPageChange,
  currentPage = 1,
  activeFiltersCount = 0,
}: ResultsHeaderProps) {
  const [sortBy, setSortBy] = useState("best-selling")
  const [perPage, setPerPage] = useState(24)

  const displayedProducts = filteredProducts ?? totalProducts
  const startIndex = (currentPage - 1) * perPage + 1
  const endIndex = Math.min(currentPage * perPage, displayedProducts)

  const handleSortChange = (value: string) => {
    setSortBy(value)
    onSortChange?.(value)
  }

  const handlePerPageChange = (value: number) => {
    setPerPage(value)
    onPerPageChange?.(value)
  }

  return null


}

