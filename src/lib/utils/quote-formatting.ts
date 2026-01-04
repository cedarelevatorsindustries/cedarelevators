interface QuoteItemData {
    id: string;
    title: string;
    amount: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    expiry?: string;
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
