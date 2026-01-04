'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

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

/**
 * Get quick stats for admin dashboard
 */
export async function getQuickStats(): Promise<QuickStats> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { totalProducts: 0, totalOrders: 0, quoteRequests: 0, totalCategories: 0, totalCustomers: 0 }
        }

        // Fetch all counts in parallel
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
 * Get quote chart data by view type
 */
export async function getQuoteChartData(view: 'daily' | 'weekly' | 'monthly'): Promise<QuoteChartData[]> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return []

        const now = new Date()
        let startDate: Date
        let groupFormat: string

        switch (view) {
            case 'daily':
                // Last 7 days
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
            case 'weekly':
                // Last 4 weeks
                startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
                break
            case 'monthly':
                // Last 12 months
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
                break
            default:
                startDate = new Date(now.getFullYear(), 0, 1)
        }

        const { data: quotes, error } = await supabase
            .from('quotes')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true })

        if (error || !quotes) {
            return getEmptyChartData(view)
        }

        // Group quotes by time period
        const grouped = groupQuotesByPeriod(quotes, view, now)
        return grouped
    } catch (error) {
        console.error('Error fetching quote chart data:', error)
        return getEmptyChartData(view)
    }
}

function groupQuotesByPeriod(quotes: any[], view: 'daily' | 'weekly' | 'monthly', now: Date): QuoteChartData[] {
    const grouped: Record<string, number> = {}

    if (view === 'daily') {
        // Group by day of week for last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dayMap: Record<string, number> = {}
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const dayName = days[date.getDay()]
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
        // Group by week for last 4 weeks
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
        // Group by month for last 12 months
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
            const [year, month] = key.split('-')
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

