"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FilterGroupProps {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
  count?: number
}

export function FilterGroup({ title, children, defaultExpanded = true, count }: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-b border-gray-200 last:border-b-0 py-4 first:pt-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3 group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            {title}
          </h4>
          {count !== undefined && count > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}
