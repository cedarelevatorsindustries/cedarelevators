"use client"

import React from "react"

interface ChartEmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  hint?: string
}

/**
 * Clean empty/error state for dashboard visualizations, adapted from Mergex OS.
 */
export function ChartEmptyState({
  icon: Icon,
  title,
  description,
  hint,
}: ChartEmptyStateProps) {
  return (
    <div className="flex h-full min-h-[210px] flex-col items-center justify-center px-4 py-8 text-center">
      <div
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: "#F9F8F5", border: "1px solid #EAE8E2" }}
      >
        <Icon className="h-5 w-5" style={{ color: "#A09B94" }} />
      </div>
      <div className="max-w-[260px] space-y-1">
        <p className="text-[13px] font-medium" style={{ color: "#171717" }}>
          {title}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#77736D" }}>
          {description}
        </p>
        {hint && (
          <p
            className="mt-2 inline-block rounded-md px-2.5 py-1 text-[11px]"
            style={{
              backgroundColor: "#F9F8F5",
              border: "1px solid #EAE8E2",
              color: "#77736D",
            }}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}
