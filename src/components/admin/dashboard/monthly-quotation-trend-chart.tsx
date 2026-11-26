"use client"

import React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, AlertCircle } from "lucide-react"
import type { DashboardMonthlyTrendPoint } from "@/lib/actions/admin-dashboard"
import { ChartTooltip } from "./chart-tooltip"
import { ChartEmptyState } from "./chart-empty-state"

interface MonthlyQuotationTrendChartProps {
  data: DashboardMonthlyTrendPoint[]
  isLoading?: boolean
  error?: string | null
}

export function MonthlyQuotationTrendChart({
  data,
  isLoading = false,
  error = null,
}: MonthlyQuotationTrendChartProps) {
  const trailingTotal = data.reduce((sum, pt) => sum + pt.count, 0)

  return (
    <section className="cedar-admin-card flex h-full flex-col p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3
            className="text-[17px] font-semibold tracking-tight"
            style={{ color: "#171717" }}
          >
            Monthly Quotation Trend
          </h3>
          <p className="mt-0.5 text-[13px]" style={{ color: "#77736D" }}>
            Trailing 12-month quotation volume across Cedar Elevators.
          </p>
        </div>
        {!isLoading && !error && (
          <span className="cedar-admin-pill shrink-0">
            {trailingTotal.toLocaleString("en-IN")} / 12 mo
          </span>
        )}
      </div>

      <div className="cedar-admin-chart-trend flex-1">
        {isLoading ? (
          <div
            className="h-[225px] w-full animate-pulse rounded-xl"
            style={{ backgroundColor: "#F9F8F5" }}
          />
        ) : error ? (
          <ChartEmptyState
            icon={AlertCircle}
            title="Unable to Load Trend"
            description={error}
          />
        ) : data.length === 0 ? (
          <ChartEmptyState
            icon={TrendingUp}
            title="No Monthly Trend Yet"
            description="Monthly quotation volume will appear as quotations are logged."
          />
        ) : (
          <div className="cedar-admin-chart-trend">
            <ResponsiveContainer width="100%" height={225}>
              <LineChart
                data={data}
                margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EAE8E2"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
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
                  content={<ChartTooltip suffix=" quotes" />}
                  cursor={{ stroke: "#DCD8CE", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Quotations"
                  stroke="#2B2927"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#2B2927", strokeWidth: 0 }}
                  activeDot={{
                    r: 4.5,
                    fill: "#E85A24",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  )
}
