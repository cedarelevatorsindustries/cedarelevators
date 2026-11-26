"use client"

import React, { useId } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  DashboardActivityPoint,
  DashboardDateRange,
} from "@/lib/actions/admin-dashboard"
import { ChartTooltip } from "./chart-tooltip"
import { ChartEmptyState } from "./chart-empty-state"

const RANGE_OPTIONS: Array<{ value: DashboardDateRange; label: string }> = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "year", label: "This year" },
]

interface QuotationActivityChartProps {
  data: DashboardActivityPoint[]
  range: DashboardDateRange
  onRangeChange: (range: DashboardDateRange) => void
  isLoading?: boolean
  isUpdating?: boolean
  error?: string | null
}

export function QuotationActivityChart({
  data,
  range,
  onRangeChange,
  isLoading = false,
  isUpdating = false,
  error = null,
}: QuotationActivityChartProps) {
  const gradientId = useId().replace(/:/g, "")
  const totalInRange = data.reduce((sum, pt) => sum + pt.count, 0)

  return (
    <section className="cedar-admin-card flex h-full flex-col p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h3
              className="text-[17px] font-semibold tracking-tight"
              style={{ color: "#171717" }}
            >
              Quotation Activity
            </h3>
            {!isLoading && !error && (
              <span className="cedar-admin-pill">
                {totalInRange.toLocaleString("en-IN")} total
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px]" style={{ color: "#77736D" }}>
            Track incoming quotation requests over time.
          </p>
        </div>

        {/* Date-range switcher */}
        <div
          role="group"
          aria-label="Quotation activity date range"
          className="cedar-admin-range-group"
        >
          {RANGE_OPTIONS.map((option) => {
            const active = range === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onRangeChange(option.value)}
                disabled={isLoading || isUpdating}
                className={cn(
                  "cedar-admin-range-btn disabled:opacity-60",
                  active && "cedar-admin-range-btn-active"
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="cedar-admin-chart-activity relative flex-1">
        {isLoading ? (
          <div className="flex h-[260px] flex-col justify-end gap-3 pt-4">
            <div className="flex h-full items-end gap-2">
              {[42, 65, 38, 82, 54, 70, 48, 60, 75, 45].map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 animate-pulse rounded-t-md"
                  style={{ height: `${h}%`, backgroundColor: "#F3F2EE" }}
                />
              ))}
            </div>
            <div
              className="h-3 w-full animate-pulse rounded"
              style={{ backgroundColor: "#F7F6F3" }}
            />
          </div>
        ) : error ? (
          <ChartEmptyState
            icon={AlertCircle}
            title="Unable to Load Activity"
            description={error}
          />
        ) : data.length === 0 ? (
          <ChartEmptyState
            icon={FileText}
            title="No Quotation Activity"
            description="Incoming quotation volume will appear here as requests arrive."
          />
        ) : (
          <div
            className={cn(
              "cedar-admin-chart-activity transition-opacity duration-200",
              isUpdating && "opacity-60"
            )}
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E85A24" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#E85A24" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EAE8E2"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  interval={range === "30d" ? 4 : "preserveStartEnd"}
                  tick={{ fill: "#A09B94", fontSize: 11 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(dataMax, 4)]}
                  tick={{ fill: "#A09B94", fontSize: 11 }}
                  width={42}
                />
                <Tooltip
                  content={<ChartTooltip suffix=" requests" />}
                  cursor={{ stroke: "#DCD8CE", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Quotations"
                  stroke="#E85A24"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  activeDot={{
                    r: 4,
                    fill: "#E85A24",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  )
}
