"use server"

import { getSupabaseClient } from "@/lib/supabase/client"
import { auth } from "@clerk/nextjs/server"
import type { QuoteItemData } from "@/modules/quote/templates/individual-quote-template"

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
            .eq('clerk_user_id', userId)
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

/**
 * Format quotes data for the template
 */
export function formatQuotesForTemplate(quotes: any[]): QuoteItemData[] {
    return quotes.map(quote => {
        // Format amount
        const amount = formatCurrency(parseFloat(quote.estimated_total || 0))

        // Calculate expiry if pending
        let expiry: string | undefined
        if (quote.status === 'pending' && quote.valid_until) {
            const validUntil = new Date(quote.valid_until)
            const now = new Date()
            const hoursLeft = Math.max(0, Math.floor((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60)))

            if (hoursLeft > 0) {
                expiry = `Expires ${hoursLeft}h`
            } else {
                expiry = "Expired"
            }
        }

        return {
            id: quote.quote_number || quote.id,
            title: extractQuoteTitle(quote),
            amount,
            status: mapQuoteStatus(quote.status),
            expiry
        }
    })
}

/**
 * Extract a title from quote notes or use a default
 */
function extractQuoteTitle(quote: any): string {
    // Try to get first line of notes
    if (quote.notes) {
        const firstLine = quote.notes.split('\n')[0]
        if (firstLine && firstLine.length > 0) {
            return firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '')
        }
    }

    // Fallback to quote number
    return `Quote ${quote.quote_number || 'Draft'}`
}

/**
 * Map database status to template status
 */
function mapQuoteStatus(status: string): 'pending' | 'accepted' | 'rejected' | 'completed' {
    const statusMap: Record<string, 'pending' | 'accepted' | 'rejected' | 'completed'> = {
        'draft': 'pending',
        'submitted': 'pending',
        'reviewing': 'pending',
        'quoted': 'accepted',
        'accepted': 'accepted',
        'rejected': 'rejected',
        'expired': 'rejected',
        'converted': 'completed',
        'completed': 'completed'
    }

    return statusMap[status] || 'pending'
}

/**
 * Format currency for Indian Rupees
 */
export function formatCurrency(amount: number): string {
    if (amount === 0) return "₹0"

    // Format for Indian numbering system
    if (amount >= 10000000) { // 1 Crore
        return `₹${(amount / 10000000).toFixed(1)} Cr`
    } else if (amount >= 100000) { // 1 Lakh
        return `₹${(amount / 100000).toFixed(1)} L`
    } else if (amount >= 1000) { // 1 Thousand
        return `₹${(amount / 1000).toFixed(1)}k`
    } else {
        return `₹${amount.toFixed(0)}`
    }
}
