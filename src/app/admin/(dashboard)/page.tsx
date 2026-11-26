"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { toast } from "sonner"
import {
  Plus,
  Package,
  Settings,
  FolderTree,
  FileText,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { DashboardMetricCard } from "@/components/admin/dashboard/dashboard-metric-card"
import { CatalogOverviewPanel } from "@/components/admin/dashboard/catalog-overview-panel"
import { RecentQuotationsList } from "@/components/admin/dashboard/recent-quotations-list"
import { RecentActivities } from "@/modules/admin/dashboard/recent-activities"
import {
  getAdminDashboardOverview,
  type AdminDashboardOverview,
  type DashboardDateRange,
} from "@/lib/actions/admin-dashboard"
import { getRecentActivity, type RecentActivity } from "@/lib/actions/analytics"
import { cn } from "@/lib/utils"

// Lazy-load Recharts visualizations so unrelated admin routes never pull chart bundles
const QuotationActivityChart = dynamic(
  () =>
    import("@/components/admin/dashboard/quotation-activity-chart").then(
      (mod) => mod.QuotationActivityChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="cedar-admin-card h-[360px] animate-pulse p-6">
        <div className="h-5 w-40 rounded" style={{ backgroundColor: "#F3F2EE" }} />
        <div className="mt-2 h-3.5 w-64 rounded" style={{ backgroundColor: "#F7F6F3" }} />
        <div className="mt-6 h-[240px] rounded-xl" style={{ backgroundColor: "#F9F8F5" }} />
      </div>
    ),
  }
)

const QuotationStatusChart = dynamic(
  () =>
    import("@/components/admin/dashboard/quotation-status-chart").then(
      (mod) => mod.QuotationStatusChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="cedar-admin-card h-[360px] animate-pulse p-6">
        <div className="h-5 w-36 rounded" style={{ backgroundColor: "#F3F2EE" }} />
        <div className="mt-2 h-3.5 w-52 rounded" style={{ backgroundColor: "#F7F6F3" }} />
        <div className="mt-6 h-[240px] rounded-xl" style={{ backgroundColor: "#F9F8F5" }} />
      </div>
    ),
  }
)

const MonthlyQuotationTrendChart = dynamic(
  () =>
    import("@/components/admin/dashboard/monthly-quotation-trend-chart").then(
      (mod) => mod.MonthlyQuotationTrendChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="cedar-admin-card h-[320px] animate-pulse p-6">
        <div className="h-5 w-48 rounded" style={{ backgroundColor: "#F3F2EE" }} />
        <div className="mt-2 h-3.5 w-64 rounded" style={{ backgroundColor: "#F7F6F3" }} />
        <div className="mt-6 h-[200px] rounded-xl" style={{ backgroundColor: "#F9F8F5" }} />
      </div>
    ),
  }
)

const quickActions = [
  { title: "Review Quotes", href: "/admin/quotes", icon: FileText, primary: true },
  { title: "Add Product", href: "/admin/products/create", icon: Plus },
  { title: "Manage Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

function getLocalGreetingPhrase(hour: number): string {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function resolveAdminFirstName(overview: AdminDashboardOverview | null): string | null {
  if (!overview) return null
  const rawDisplay = overview.admin.displayName?.trim()
  if (rawDisplay) {
    return rawDisplay
  }
  const emailLocal = overview.admin.email?.split("@")[0]?.trim()
  if (emailLocal) {
    return emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1)
  }
  return null
}

function getMonthComparison(current: number, previous: number): {
  trend?: { text: string; positive?: boolean; neutral?: boolean }
  subtitle: string
} {
  if (previous > 0) {
    const pct = Math.round(((current - previous) / previous) * 100)
    const sign = pct > 0 ? "+" : ""
    return {
      trend: {
        text: `${sign}${pct}%`,
        positive: pct > 0,
        neutral: pct === 0,
      },
      subtitle: `${current} this month vs ${previous} last month`,
    }
  }
  return {
    subtitle: `${current} submitted this month`,
  }
}

export default function AdminDashboard() {
  const [range, setRange] = useState<DashboardDateRange>("30d")
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRangeUpdating, setIsRangeUpdating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [greetingPhrase, setGreetingPhrase] = useState<string | null>(null)

  // Client-only local time initialization prevents SSR/CSR hydration mismatches
  useEffect(() => {
    const updateGreeting = () => {
      setGreetingPhrase(getLocalGreetingPhrase(new Date().getHours()))
    }
    updateGreeting()
    const interval = setInterval(updateGreeting, 60_000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = useCallback(
    async (selectedRange: DashboardDateRange, options?: { isManualRefresh?: boolean; isRangeChange?: boolean }) => {
      if (options?.isRangeChange) {
        setIsRangeUpdating(true)
      }
      setLoadError(null)

      try {
        const [overviewRes, activitiesData] = await Promise.all([
          getAdminDashboardOverview(selectedRange),
          getRecentActivity(10),
        ])

        if (overviewRes.success) {
          setOverview(overviewRes.data)
          if (options?.isManualRefresh) {
            toast.success("Dashboard refreshed")
          }
        } else {
          setLoadError(overviewRes.error || "Unable to load dashboard overview.")
          if (options?.isManualRefresh) {
            toast.error("Failed to refresh dashboard")
          }
        }

        setActivities(activitiesData || [])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setLoadError("Unable to reach server while loading dashboard metrics.")
        if (options?.isManualRefresh) {
          toast.error("Failed to refresh dashboard")
        }
      } finally {
        setIsLoading(false)
        setIsRangeUpdating(false)
        setIsRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    loadDashboardData("30d")
  }, [loadDashboardData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadDashboardData(range, { isManualRefresh: true })
  }

  const handleRangeChange = (nextRange: DashboardDateRange) => {
    if (nextRange === range) return
    setRange(nextRange)
    loadDashboardData(nextRange, { isRangeChange: true })
  }

  const metrics = overview?.metrics ?? null
  const adminName = resolveAdminFirstName(overview)
  const totalQuotesComparison = metrics
    ? getMonthComparison(metrics.thisMonthQuotations, metrics.lastMonthQuotations)
    : { trend: undefined, subtitle: undefined }

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Section 1 — Personalized Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1
            className="font-cedar-serif text-[32px] sm:text-[38px] lg:text-[42px] font-normal leading-[1.14] tracking-[-0.02em]"
            style={{ color: "#171717" }}
            suppressHydrationWarning
          >
            {greetingPhrase ? (
              adminName ? (
                <>
                  {greetingPhrase},{" "}
                  <span className="italic">{adminName}.</span>
                </>
              ) : (
                `${greetingPhrase}.`
              )
            ) : (
              "Welcome back."
            )}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#77736D" }}>
            Here&apos;s what&apos;s happening across Cedar Elevators today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="cedar-admin-btn-compact"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                isRefreshing && "animate-spin"
              )}
              style={{ color: isRefreshing ? "#E85A24" : "#77736D" }}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Explicit Query Error Banner (never masquerade failure as 0) */}
      {loadError && !isLoading && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-[12px] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
          style={{
            backgroundColor: "#FDF2F1",
            border: "1px solid #ECC8C5",
            color: "#9E352D",
          }}
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "#C84B42" }} />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="cedar-admin-btn-compact w-fit"
            style={{ borderColor: "#E2B4B0", color: "#9E352D" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Section 2 — Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          label="Total Quotations"
          value={loadError && !metrics ? "—" : (metrics?.totalQuotations ?? 0)}
          icon={FileText}
          href="/admin/quotes"
          isLoading={isLoading}
          trend={totalQuotesComparison.trend}
          subtitle={totalQuotesComparison.subtitle}
        />

        <DashboardMetricCard
          label="Pending Review"
          value={loadError && !metrics ? "—" : (metrics?.pendingReviewQuotations ?? 0)}
          icon={Clock}
          href="/admin/quotes"
          accent
          isLoading={isLoading}
          subtitle={
            metrics
              ? `${metrics.submittedQuotations} submitted · ${metrics.reviewingQuotations} under review`
              : undefined
          }
        />

        <DashboardMetricCard
          label="Quoted"
          value={loadError && !metrics ? "—" : (metrics?.quotedQuotations ?? 0)}
          icon={CheckCircle2}
          href="/admin/quotes"
          isLoading={isLoading}
          subtitle={
            metrics
              ? `${metrics.rejectedQuotations} rejected · ${metrics.expiredQuotations} expired`
              : undefined
          }
        />

        <DashboardMetricCard
          label="Total Products"
          value={loadError && !metrics ? "—" : (metrics?.totalProducts ?? 0)}
          icon={Package}
          href="/admin/products"
          isLoading={isLoading}
          subtitle={
            metrics
              ? `${metrics.activeProducts} active · ${metrics.totalCategories} categories`
              : undefined
          }
        />
      </div>

      {/* Section 3 — Quick Actions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-[12px] font-medium uppercase tracking-[0.06em]"
            style={{ color: "#77736D" }}
          >
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={
                action.primary
                  ? "cedar-admin-btn-primary"
                  : "cedar-admin-btn-neutral"
              }
            >
              <action.icon
                className="h-4 w-4 shrink-0"
                style={{ color: action.primary ? "#FFFFFF" : "#77736D" }}
              />
              <span className="truncate">{action.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 4 — Analytics (Recharts) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8 min-w-0">
          <QuotationActivityChart
            data={overview?.activitySeries ?? []}
            range={range}
            onRangeChange={handleRangeChange}
            isLoading={isLoading}
            isUpdating={isRangeUpdating}
            error={loadError && !overview ? loadError : null}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 min-w-0">
          <QuotationStatusChart
            data={overview?.statusDistribution ?? []}
            isLoading={isLoading}
            error={loadError && !overview ? loadError : null}
          />
        </div>
      </div>

      {/* Section 4b — Monthly Trend + Catalog Summary */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 min-w-0">
          <MonthlyQuotationTrendChart
            data={overview?.monthlyTrend ?? []}
            isLoading={isLoading}
            error={loadError && !overview ? loadError : null}
          />
        </div>
        <div className="lg:col-span-5 min-w-0">
          <CatalogOverviewPanel metrics={metrics} isLoading={isLoading} />
        </div>
      </div>

      {/* Section 5 & 6 — Recent Quotations & Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 min-w-0">
          <RecentQuotationsList
            quotations={overview?.recentQuotations ?? []}
            isLoading={isLoading}
            error={loadError && !overview ? loadError : null}
          />
        </div>
        <div className="lg:col-span-5 min-w-0">
          <RecentActivities activities={activities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
