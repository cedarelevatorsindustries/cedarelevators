"use client"

import React from "react"

interface TooltipPayloadEntry {
  name?: string
  value?: number | string
  color?: string
  payload?: {
    fullDate?: string
    fullMonth?: string
    fullName?: string
    fill?: string
    color?: string
  }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  prefix?: string
  suffix?: string
}

/**
 * Custom Recharts tooltip adapted from Mergex OS patterns and styled with
 * Cedar Admin's warm-neutral palette.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  prefix = "",
  suffix = "",
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const first = payload[0]
  const heading =
    first?.payload?.fullDate ||
    first?.payload?.fullMonth ||
    first?.payload?.fullName ||
    label

  return (
    <div className="cedar-admin-tooltip text-xs">
      {heading && (
        <p className="mb-1.5 font-medium tracking-tight" style={{ color: "#171717" }}>
          {heading}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((item, idx) => {
          const swatchColor =
            item.color || item.payload?.color || item.payload?.fill || "#E85A24"
          const numericVal = Number(item.value ?? 0)
          return (
            <div key={idx} className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: swatchColor }}
              />
              <span style={{ color: "#77736D" }}>
                {item.name || "Quotations"}:
              </span>
              <span
                className="ml-auto font-medium tabular-nums"
                style={{ color: "#171717" }}
              >
                {prefix}
                {numericVal.toLocaleString("en-IN")}
                {suffix}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
