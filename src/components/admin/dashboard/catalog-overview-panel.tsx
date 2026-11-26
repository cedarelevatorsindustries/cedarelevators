"use client"

import Link from "next/link"
import { ArrowRight, FolderTree, Package, Clock, Sparkles } from "lucide-react"
import type { AdminDashboardMetrics } from "@/lib/actions/admin-dashboard"

interface CatalogOverviewPanelProps {
  metrics: AdminDashboardMetrics | null
  isLoading?: boolean
}

export function CatalogOverviewPanel({
  metrics,
  isLoading = false,
}: CatalogOverviewPanelProps) {
  const rows = [
    {
      label: "Active catalog products",
      value: metrics?.activeProducts ?? 0,
      hint: "Live on storefront",
      icon: Package,
      href: "/admin/products",
      dotColor: "#238A62",
    },
    {
      label: "Inactive or draft products",
      value: metrics?.inactiveProducts ?? 0,
      hint: "Draft & archived",
      icon: Clock,
      href: "/admin/products",
      dotColor: "#A09B94",
    },
    {
      label: "Total categories",
      value: metrics?.totalCategories ?? 0,
      hint: metrics ? `${metrics.activeCategories} active` : "Organized catalog",
      icon: FolderTree,
      href: "/admin/categories",
      dotColor: "#4D6F8F",
    },
    {
      label: "Added in last 30 days",
      value: metrics?.recentlyAddedProducts ?? 0,
      hint: "New catalog items",
      icon: Sparkles,
      href: "/admin/products",
      dotColor: "#E85A24",
    },
  ]

  return (
    <section className="cedar-admin-card flex h-full flex-col justify-between p-5 sm:p-6">
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3
              className="text-[17px] font-semibold tracking-tight"
              style={{ color: "#171717" }}
            >
              Catalog Overview
            </h3>
            <p className="mt-0.5 text-[13px]" style={{ color: "#77736D" }}>
              Current product availability and category coverage.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-xs font-medium transition-colors shrink-0 hover:opacity-80"
            style={{ color: "#77736D" }}
          >
            <span>Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="cedar-admin-divided">
          {rows.map((row) => (
            <Link
              key={row.label}
              href={row.href}
              className="group flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1 hover:bg-[#F9F8F5] -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="cedar-admin-icon-well" style={{ width: 32, height: 32 }}>
                  <row.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate text-[13.5px] font-medium transition-colors"
                    style={{ color: "#171717" }}
                  >
                    {row.label}
                  </p>
                  <p className="truncate text-[12px]" style={{ color: "#77736D" }}>
                    {row.hint}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: row.dotColor }}
                />
                {isLoading ? (
                  <div
                    className="h-5 w-8 animate-pulse rounded"
                    style={{ backgroundColor: "#F3F2EE" }}
                  />
                ) : (
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: "#171717" }}
                  >
                    {row.value.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div
        className="cedar-admin-card-footer mt-4 flex items-center justify-between pt-3.5 text-xs"
        style={{ color: "#77736D" }}
      >
        <span>This month&apos;s quotations</span>
        {isLoading ? (
          <div
            className="h-4 w-10 animate-pulse rounded"
            style={{ backgroundColor: "#F3F2EE" }}
          />
        ) : (
          <span className="font-semibold tabular-nums" style={{ color: "#171717" }}>
            {(metrics?.thisMonthQuotations ?? 0).toLocaleString("en-IN")}
          </span>
        )}
      </div>
    </section>
  )
}
