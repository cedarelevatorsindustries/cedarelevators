"use client"

import React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3, AlertCircle } from "lucide-react"
import type { DashboardStatusItem } from "@/lib/actions/admin-dashboard"
import { ChartTooltip } from "./chart-tooltip"
import { ChartEmptyState } from "./chart-empty-state"

interface QuotationStatusChartProps {
  data: DashboardStatusItem[]
  isLoading?: boolean
  error?: string | null
}

export function QuotationStatusChart({
  data,
  isLoading = false,
  error = null,
}: QuotationStatusChartProps) {
  const totalQuotes = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="cedar-admin-card flex h-full flex-col p-5 sm:p-6">
      <div className="mb-5">
        <h3
          className="text-[17px] font-semibold tracking-tight"
          style={{ color: "#171717" }}
        >
          Quotation Status
        </h3>
        <p className="mt-0.5 text-[13px]" style={{ color: "#77736D" }}>
          Distribution across quotation workflow stages.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="flex h-[210px] items-end gap-4 pt-4">
            {[55, 40, 75, 25, 20].map((h, idx) => (
              <div
                key={idx}
                className="flex-1 animate-pulse rounded-t-md"
                style={{ height: `${h}%`, backgroundColor: "#F3F2EE" }}
              />
            ))}
          </div>
        ) : error ? (
          <ChartEmptyState
            icon={AlertCircle}
            title="Unable to Load Status"
            description={error}
          />
        ) : totalQuotes === 0 ? (
          <ChartEmptyState
            icon={BarChart3}
            title="No Quotations Yet"
            description="Status breakdown will appear once quotation requests are received."
          />
        ) : (
          <>
            <div className="cedar-admin-chart-status">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart
                  data={data}
                  margin={{ top: 8, right: 6, left: -22, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#EAE8E2"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={{ fill: "#77736D", fontSize: 10.5 }}
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
                    cursor={{ fill: "#F9F8F5" }}
                  />
                  <Bar
                    dataKey="count"
                    name="Quotes"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                    isAnimationActive={false}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Compact legend summary */}
            <div className="cedar-admin-card-footer mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 pt-3.5 text-xs">
              {data.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate" style={{ color: "#77736D" }}>
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="font-medium tabular-nums"
                    style={{ color: "#171717" }}
                  >
                    {item.count.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
