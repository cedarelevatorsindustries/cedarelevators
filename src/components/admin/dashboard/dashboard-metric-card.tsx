"use client"

import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardMetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  href?: string
  subtitle?: string
  accent?: boolean
  isLoading?: boolean
  trend?: {
    text: string
    positive?: boolean
    neutral?: boolean
  }
}

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  href,
  subtitle,
  accent = false,
  isLoading = false,
  trend,
}: DashboardMetricCardProps) {
  const cardBody = (
    <div
      className={cn(
        "cedar-admin-metric-card group relative flex h-full flex-col justify-between",
        href && "cedar-admin-metric-card-link cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.06em]"
          style={{ color: "#77736D" }}
        >
          {label}
        </span>
        <div
          className={cn(
            "cedar-admin-icon-well",
            accent && "cedar-admin-icon-well-accent"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline justify-between gap-2">
        {isLoading ? (
          <div
            className="h-9 w-20 animate-pulse rounded-md"
            style={{ backgroundColor: "#F3F2EE" }}
          />
        ) : (
          <span
            className="text-[30px] leading-none font-semibold tracking-tight tabular-nums"
            style={{ color: "#171717" }}
          >
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </span>
        )}
        {href && !isLoading && (
          <ArrowUpRight
            className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: "#A09B94" }}
          />
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          {isLoading ? (
            <div
              className="h-3.5 w-28 animate-pulse rounded"
              style={{ backgroundColor: "#F7F6F3" }}
            />
          ) : (
            <>
              {trend && (
                <span
                  className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums"
                  style={{
                    backgroundColor: trend.neutral
                      ? "#F3F2EE"
                      : trend.positive
                      ? "#EAF6F0"
                      : "#FDF2F1",
                    color: trend.neutral
                      ? "#77736D"
                      : trend.positive
                      ? "#238A62"
                      : "#C84B42",
                  }}
                >
                  {trend.text}
                </span>
              )}
              {subtitle && (
                <span className="truncate text-[12px]" style={{ color: "#77736D" }}>
                  {subtitle}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-[14px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85A24]/30"
      >
        {cardBody}
      </Link>
    )
  }

  return cardBody
}
