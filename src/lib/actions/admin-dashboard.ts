'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, type AdminRole } from '@/lib/auth/require-admin'

export interface QuickStats {
    totalProducts: number
    totalOrders: number
    quoteRequests: number
    totalCategories: number
    totalCustomers: number
}

export interface QuoteChartData {
    name: string
    count: number
}

export type DashboardDateRange = '7d' | '30d' | '90d' | 'year'

export interface DashboardActivityPoint {
    label: string
    fullDate: string
    count: number
}

export interface DashboardStatusItem {
    key: string
    label: string
    count: number
    color: string
}

export interface DashboardMonthlyTrendPoint {
    month: string
    fullMonth: string
    count: number
}

export interface DashboardRecentQuote {
    id: string
    quoteNumber: string
    customerName: string
    companyName: string | null
    requestType: string | null
    itemCount: number
    status: string
    createdAt: string
    estimatedTotal: number | null
}

export interface DashboardAdminIdentity {
    displayName: string | null
    email: string
    role: AdminRole
    avatarUrl: string | null
}

export interface AdminDashboardMetrics {
    totalQuotations: number
    submittedQuotations: number
    reviewingQuotations: number
    pendingReviewQuotations: number
    quotedQuotations: number
    rejectedQuotations: number
    expiredQuotations: number
    convertedQuotations: number
    thisMonthQuotations: number
    lastMonthQuotations: number
    totalProducts: number
    activeProducts: number
    inactiveProducts: number
    recentlyAddedProducts: number
    totalCategories: number
    activeCategories: number
    totalOrders: number
    totalCustomers: number
}

export interface AdminDashboardOverview {
    admin: DashboardAdminIdentity
    metrics: AdminDashboardMetrics
    activitySeries: DashboardActivityPoint[]
    statusDistribution: DashboardStatusItem[]
    monthlyTrend: DashboardMonthlyTrendPoint[]
    recentQuotations: DashboardRecentQuote[]
    range: DashboardDateRange
    generatedAt: string
}

export type AdminDashboardOverviewResult =
    | { success: true; data: AdminDashboardOverview }
    | { success: false; error: string }

/**
 * Get quick stats for admin dashboard (authenticated admin + service-role read)
 */
export async function getQuickStats(): Promise<QuickStats> {
    try {
        const authCheck = await requireAdmin('staff')
        if (!authCheck.authorized) {
            return { totalProducts: 0, totalOrders: 0, quoteRequests: 0, totalCategories: 0, totalCustomers: 0 }
        }

        const supabase = createAdminClient()

        const [
            { count: productsCount },
            { count: ordersCount },
            { count: quotesCount },
            { count: categoriesCount },
            { count: customersCount }
        ] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('*', { count: 'exact', head: true }),
            supabase.from('quotes').select('*', { count: 'exact', head: true }),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            supabase.from('customer_meta').select('*', { count: 'exact', head: true })
        ])

        return {
            totalProducts: productsCount || 0,
            totalOrders: ordersCount || 0,
            quoteRequests: quotesCount || 0,
            totalCategories: categoriesCount || 0,
            totalCustomers: customersCount || 0,
        }
    } catch (error) {
        console.error('Error fetching quick stats:', error)
        return { totalProducts: 0, totalOrders: 0, quoteRequests: 0, totalCategories: 0, totalCustomers: 0 }
    }
}

/**
 * Get quote chart data by view type (legacy compatibility wrapper)
 */
export async function getQuoteChartData(view: 'daily' | 'weekly' | 'monthly'): Promise<QuoteChartData[]> {
    try {
        const authCheck = await requireAdmin('staff')
        if (!authCheck.authorized) {
            return getEmptyChartData(view)
        }

        const supabase = createAdminClient()
        const now = new Date()
        let startDate: Date

        switch (view) {
            case 'daily':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
            case 'weekly':
                startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
                break
            case 'monthly':
            default:
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
                break
        }

        const { data: quotes, error } = await supabase
            .from('quotes')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true })

        if (error || !quotes) {
            return getEmptyChartData(view)
        }

        return groupQuotesByPeriod(quotes, view, now)
    } catch (error) {
        console.error('Error fetching quote chart data:', error)
        return getEmptyChartData(view)
    }
}

/**
 * Comprehensive server-side overview for the redesigned Cedar Admin Dashboard.
 * Preserves RBAC (`requireAdmin('staff')`) and returns real Supabase data with explicit error reporting.
 */
export async function getAdminDashboardOverview(
    range: DashboardDateRange = '30d'
): Promise<AdminDashboardOverviewResult> {
    try {
        const authCheck = await requireAdmin('staff')
        if (!authCheck.authorized) {
            return { success: false, error: authCheck.error || 'Unauthorized' }
        }

        const supabase = createAdminClient()
        const now = new Date()

        // 12-month horizon covers 'year', '90d', '30d', '7d', plus month-over-month deltas
        const twelveMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const [
            quoteStatusesRes,
            quoteTimelineRes,
            recentQuotesRes,
            productsRes,
            categoriesTotalRes,
            categoriesActiveRes,
            ordersTotalRes,
            customersTotalRes,
        ] = await Promise.all([
            supabase.from('quotes').select('status'),
            supabase
                .from('quotes')
                .select('created_at')
                .gte('created_at', twelveMonthsAgoStart.toISOString())
                .order('created_at', { ascending: true }),
            supabase
                .from('quotes')
                .select(`
                    id,
                    quote_number,
                    guest_name,
                    requester_name,
                    company_name,
                    request_type,
                    status,
                    estimated_total,
                    created_at,
                    items:quote_items(id)
                `)
                .order('created_at', { ascending: false })
                .limit(6),
            supabase.from('products').select('status, created_at'),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            supabase.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('orders').select('*', { count: 'exact', head: true }),
            supabase.from('customer_meta').select('*', { count: 'exact', head: true }),
        ])

        if (quoteStatusesRes.error) {
            return { success: false, error: `Failed to load quotation metrics: ${quoteStatusesRes.error.message}` }
        }
        if (quoteTimelineRes.error) {
            return { success: false, error: `Failed to load quotation timeline: ${quoteTimelineRes.error.message}` }
        }
        if (recentQuotesRes.error) {
            return { success: false, error: `Failed to load recent quotations: ${recentQuotesRes.error.message}` }
        }
        if (productsRes.error) {
            return { success: false, error: `Failed to load product metrics: ${productsRes.error.message}` }
        }
        if (categoriesTotalRes.error) {
            return { success: false, error: `Failed to load category metrics: ${categoriesTotalRes.error.message}` }
        }

        const quoteStatusRows = quoteStatusesRes.data || []
        const quoteTimelineRows = quoteTimelineRes.data || []
        const productRows = productsRes.data || []

        // Status counts mapped cleanly without double-counting
        let submittedQuotations = 0
        let reviewingQuotations = 0
        let quotedQuotations = 0
        let rejectedQuotations = 0
        let expiredQuotations = 0
        let convertedQuotations = 0

        for (const row of quoteStatusRows) {
            const status = row.status
            if (status === 'submitted' || status === 'pending') {
                submittedQuotations++
            } else if (status === 'reviewing') {
                reviewingQuotations++
            } else if (status === 'quoted' || status === 'approved') {
                quotedQuotations++
            } else if (status === 'rejected') {
                rejectedQuotations++
            } else if (status === 'expired') {
                expiredQuotations++
            } else if (status === 'converted') {
                convertedQuotations++
            }
        }

        const totalQuotations = quoteStatusRows.length
        const pendingReviewQuotations = submittedQuotations + reviewingQuotations

        // Current month vs previous month boundaries
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

        let thisMonthQuotations = 0
        let lastMonthQuotations = 0
        for (const row of quoteTimelineRows) {
            const created = new Date(row.created_at)
            if (created >= currentMonthStart) {
                thisMonthQuotations++
            } else if (created >= lastMonthStart && created <= lastMonthEnd) {
                lastMonthQuotations++
            }
        }

        // Product metrics
        const totalProducts = productRows.length
        const activeProducts = productRows.filter((p) => p.status === 'active').length
        const inactiveProducts = totalProducts - activeProducts
        const recentlyAddedProducts = productRows.filter(
            (p) => p.created_at && new Date(p.created_at) >= thirtyDaysAgo
        ).length

        // Activity series for selected date range
        const activitySeries = buildActivitySeries(quoteTimelineRows, range, now)

        // Status distribution for bar chart
        const statusDistribution: DashboardStatusItem[] = [
            { key: 'submitted', label: 'Submitted', count: submittedQuotations, color: '#77736D' },
            { key: 'reviewing', label: 'Under Review', count: reviewingQuotations, color: '#4D6F8F' },
            { key: 'quoted', label: 'Quoted', count: quotedQuotations, color: '#E85A24' },
            { key: 'rejected', label: 'Rejected', count: rejectedQuotations, color: '#C84B42' },
            { key: 'expired', label: 'Expired', count: expiredQuotations, color: '#B5AFA6' },
        ]
        if (convertedQuotations > 0) {
            statusDistribution.push({
                key: 'converted',
                label: 'Converted',
                count: convertedQuotations,
                color: '#238A62',
            })
        }

        // Trailing 12-month trend
        const monthlyTrend = buildMonthlyTrendSeries(quoteTimelineRows, now)

        // Recent quotations formatted cleanly
        const recentQuotations: DashboardRecentQuote[] = (recentQuotesRes.data || []).map((q: any) => ({
            id: q.id,
            quoteNumber: q.quote_number,
            customerName: q.guest_name || q.requester_name || 'Guest Customer',
            companyName: q.company_name || null,
            requestType: q.request_type || null,
            itemCount: Array.isArray(q.items) ? q.items.length : 0,
            status: q.status,
            createdAt: q.created_at,
            estimatedTotal: q.estimated_total !== null && q.estimated_total !== undefined
                ? Number(q.estimated_total)
                : null,
        }))

        return {
            success: true,
            data: {
                admin: {
                    displayName: authCheck.adminUser.display_name,
                    email: authCheck.adminUser.email,
                    role: authCheck.adminUser.role,
                    avatarUrl: authCheck.adminUser.avatar_url || null,
                },
                metrics: {
                    totalQuotations,
                    submittedQuotations,
                    reviewingQuotations,
                    pendingReviewQuotations,
                    quotedQuotations,
                    rejectedQuotations,
                    expiredQuotations,
                    convertedQuotations,
                    thisMonthQuotations,
                    lastMonthQuotations,
                    totalProducts,
                    activeProducts,
                    inactiveProducts,
                    recentlyAddedProducts,
                    totalCategories: categoriesTotalRes.count || 0,
                    activeCategories: categoriesActiveRes.count || 0,
                    totalOrders: ordersTotalRes.count || 0,
                    totalCustomers: customersTotalRes.count || 0,
                },
                activitySeries,
                statusDistribution,
                monthlyTrend,
                recentQuotations,
                range,
                generatedAt: now.toISOString(),
            },
        }
    } catch (error: any) {
        console.error('Error fetching admin dashboard overview:', error)
        return {
            success: false,
            error: error?.message || 'Unable to load dashboard data.',
        }
    }
}

function buildActivitySeries(
    quotes: Array<{ created_at: string }>,
    range: DashboardDateRange,
    now: Date
): DashboardActivityPoint[] {
    if (range === '7d' || range === '30d') {
        const daysCount = range === '7d' ? 7 : 30
        const buckets = new Map<string, { label: string; fullDate: string; count: number }>()

        for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            buckets.set(key, {
                label: range === '7d'
                    ? d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
                    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
                count: 0,
            })
        }

        for (const q of quotes) {
            const d = new Date(q.created_at)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const bucket = buckets.get(key)
            if (bucket) {
                bucket.count++
            }
        }

        return Array.from(buckets.values())
    }

    if (range === '90d') {
        // 13 weekly buckets covering trailing ~90 days
        const totalWeeks = 13
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const rangeStart = new Date(todayStart.getTime() - (totalWeeks * 7 - 1) * 24 * 60 * 60 * 1000)

        const buckets: DashboardActivityPoint[] = []
        for (let w = 0; w < totalWeeks; w++) {
            const weekStart = new Date(rangeStart.getTime() + w * 7 * 24 * 60 * 60 * 1000)
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
            const startLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            const endLabel = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            buckets.push({
                label: startLabel,
                fullDate: `${startLabel} – ${endLabel}`,
                count: 0,
            })
        }

        for (const q of quotes) {
            const qDate = new Date(q.created_at)
            const diffDays = Math.floor((qDate.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000))
            if (diffDays >= 0) {
                const weekIdx = Math.floor(diffDays / 7)
                if (weekIdx >= 0 && weekIdx < totalWeeks) {
                    buckets[weekIdx].count++
                }
            }
        }

        return buckets
    }

    // 'year': Jan through current month of current year
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const buckets: DashboardActivityPoint[] = []

    for (let m = 0; m <= currentMonth; m++) {
        const d = new Date(currentYear, m, 1)
        buckets.push({
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            fullDate: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            count: 0,
        })
    }

    for (const q of quotes) {
        const d = new Date(q.created_at)
        if (d.getFullYear() === currentYear && d.getMonth() <= currentMonth) {
            buckets[d.getMonth()].count++
        }
    }

    return buckets
}

function buildMonthlyTrendSeries(
    quotes: Array<{ created_at: string }>,
    now: Date
): DashboardMonthlyTrendPoint[] {
    const buckets = new Map<string, DashboardMonthlyTrendPoint>()

    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        buckets.set(key, {
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            fullMonth: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            count: 0,
        })
    }

    for (const q of quotes) {
        const d = new Date(q.created_at)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        const bucket = buckets.get(key)
        if (bucket) {
            bucket.count++
        }
    }

    return Array.from(buckets.values())
}

function groupQuotesByPeriod(quotes: any[], view: 'daily' | 'weekly' | 'monthly', now: Date): QuoteChartData[] {
    if (view === 'daily') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dayMap: Record<string, number> = {}

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            dayMap[date.toDateString()] = 0
        }

        quotes.forEach(quote => {
            const date = new Date(quote.created_at)
            const key = date.toDateString()
            if (key in dayMap) {
                dayMap[key]++
            }
        })

        return Object.keys(dayMap).map(key => {
            const date = new Date(key)
            return {
                name: days[date.getDay()],
                count: dayMap[key]
            }
        })
    } else if (view === 'weekly') {
        const weeks: Record<string, number> = {
            'Week 1': 0,
            'Week 2': 0,
            'Week 3': 0,
            'Week 4': 0,
        }

        quotes.forEach(quote => {
            const quoteDate = new Date(quote.created_at)
            const diffTime = now.getTime() - quoteDate.getTime()
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
            const weekIndex = Math.floor(diffDays / 7)

            if (weekIndex >= 0 && weekIndex < 4) {
                const weekKey = `Week ${4 - weekIndex}`
                weeks[weekKey]++
            }
        })

        return Object.keys(weeks).map(week => ({
            name: week,
            count: weeks[week]
        }))
    } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthMap: Record<string, number> = {}

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`
            monthMap[monthKey] = 0
        }

        quotes.forEach(quote => {
            const date = new Date(quote.created_at)
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`
            if (monthKey in monthMap) {
                monthMap[monthKey]++
            }
        })

        return Object.keys(monthMap).map(key => {
            const [, month] = key.split('-')
            return {
                name: months[parseInt(month)],
                count: monthMap[key]
            }
        })
    }
}

function getEmptyChartData(view: 'daily' | 'weekly' | 'monthly'): QuoteChartData[] {
    if (view === 'daily') {
        return [
            { name: 'Mon', count: 0 },
            { name: 'Tue', count: 0 },
            { name: 'Wed', count: 0 },
            { name: 'Thu', count: 0 },
            { name: 'Fri', count: 0 },
            { name: 'Sat', count: 0 },
            { name: 'Sun', count: 0 },
        ]
    } else if (view === 'weekly') {
        return [
            { name: 'Week 1', count: 0 },
            { name: 'Week 2', count: 0 },
            { name: 'Week 3', count: 0 },
            { name: 'Week 4', count: 0 },
        ]
    } else {
        return [
            { name: 'Jan', count: 0 },
            { name: 'Feb', count: 0 },
            { name: 'Mar', count: 0 },
            { name: 'Apr', count: 0 },
            { name: 'May', count: 0 },
            { name: 'Jun', count: 0 },
            { name: 'Jul', count: 0 },
            { name: 'Aug', count: 0 },
            { name: 'Sep', count: 0 },
            { name: 'Oct', count: 0 },
            { name: 'Nov', count: 0 },
            { name: 'Dec', count: 0 },
        ]
    }
}
