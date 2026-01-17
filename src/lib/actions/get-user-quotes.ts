"use server"

import { getSupabaseClient } from "@/lib/supabase/client"
import { auth } from "@clerk/nextjs/server"

interface QuoteStats {
    totalSpent: number
    totalSaved: number
    quoteCount: number
    pendingCount: number
}

/**
 * Fetch user's quotes from database
 */
export async function getUserQuotes(): Promise<{ quotes: any[], stats: QuoteStats }> {
    try {
        const { userId } = await auth()

        if (!userId) {
            return {
                quotes: [],
                stats: { totalSpent: 0, totalSaved: 0, quoteCount: 0, pendingCount: 0 }
            }
        }

        const supabase = getSupabaseClient()

        // Fetch user quotes ordered by created date (newest first)
        const { data: quotes, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error("Error fetching user quotes:", error)
            return {
                quotes: [],
                stats: { totalSpent: 0, totalSaved: 0, quoteCount: 0, pendingCount: 0 }
            }
        }

        // Calculate statistics
        const stats = calculateQuoteStats(quotes || [])

        return {
            quotes: quotes || [],
            stats
        }
    } catch (error) {
        console.error("Error in getUserQuotes:", error)
        return {
            quotes: [],
            stats: { totalSpent: 0, totalSaved: 0, quoteCount: 0, pendingCount: 0 }
        }
    }
}

/**
 * Calculate statistics from quote data
 */
function calculateQuoteStats(quotes: any[]): QuoteStats {
    let totalSpent = 0
    let totalSaved = 0
    let pendingCount = 0

    quotes.forEach(quote => {
        // Count pending quotes
        if (quote.status === 'pending') {
            pendingCount++
        }

        // Calculate total spent (from completed/accepted quotes)
        if (quote.status === 'completed' || quote.status === 'accepted') {
            const estimatedTotal = parseFloat(quote.estimated_total || 0)
            if (!isNaN(estimatedTotal)) {
                totalSpent += estimatedTotal
            }
        }

        // Calculate total saved (from discount amounts)
        const discountTotal = parseFloat(quote.discount_total || 0)
        if (!isNaN(discountTotal)) {
            totalSaved += discountTotal
        }
    })

    return {
        totalSpent,
        totalSaved,
        quoteCount: quotes.length,
        pendingCount
    }
}



