'use server'

import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'

export interface BusinessHubData {
    verification: {
        isVerified: boolean
        isPending: boolean
        completionPercentage: number
    }
    actionItems: Array<{
        type: 'approval' | 'expiring'
        title: string
        subtitle: string
        href: string
        ctaText: string
    }>
    stats: {
        activeQuotes: number
        activeOrders: number
    }
}

/**
 * Fetch all data needed for the Business Hub
 * Returns verification status, action items, and quote/order stats
 */
export async function getBusinessHubData(): Promise<
    | { success: true; data: BusinessHubData }
    | { success: false; error: string }
> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const supabase = await createClerkSupabaseClient()

        // Fetch user profile for verification status
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('business_verified, business_verification_status, verification_completion_percentage')
            .eq('clerk_user_id', userId)
            .single()

        // Fetch active quotes for action items and stats
        const { data: quotes } = await supabase
            .from('quotes')
            .select('id, quote_number, status, estimated_total, expires_at, created_at, items:quote_items(id)')
            .eq('clerk_user_id', userId)
            .in('status', ['pending', 'in_review', 'negotiation'])
            .order('created_at', { ascending: false })

        // Fetch active orders count
        const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('clerk_user_id', userId)
            .in('status', ['pending', 'processing', 'confirmed'])

        // Build verification data
        const verification = {
            isVerified: profile?.business_verified || false,
            isPending: profile?.business_verification_status === 'pending',
            completionPercentage: profile?.verification_completion_percentage || 0
        }

        // Build action items
        const actionItems: BusinessHubData['actionItems'] = []
        const now = new Date()
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        if (quotes && quotes.length > 0) {
            // Add pending/in-review quotes as action items
            quotes
                .filter(q => q.status === 'pending' || q.status === 'in_review')
                .slice(0, 2) // Limit to 2 items
                .forEach(quote => {
                    const itemCount = Array.isArray(quote.items) ? quote.items.length : 0
                    const total = quote.estimated_total || 0
                    const timeAgo = getTimeAgo(new Date(quote.created_at))

                    actionItems.push({
                        type: 'approval',
                        title: `Quote #${quote.quote_number} Ready for Review`,
                        subtitle: `₹${total.toLocaleString('en-IN')} • ${itemCount} items • ${timeAgo}`,
                        href: `/quotes/${quote.id}`,
                        ctaText: 'Review Quote'
                    })
                })

            // Add expiring quotes if we have space
            if (actionItems.length < 2) {
                quotes
                    .filter(q => {
                        if (!q.expires_at) return false
                        const expiresAt = new Date(q.expires_at)
                        return expiresAt > now && expiresAt <= sevenDaysFromNow
                    })
                    .slice(0, 2 - actionItems.length)
                    .forEach(quote => {
                        const expiresAt = new Date(quote.expires_at!)
                        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                        actionItems.push({
                            type: 'expiring',
                            title: `Quote #${quote.quote_number} Expiring Soon`,
                            subtitle: `Valid until ${expiresAt.toLocaleDateString('en-IN')} • ${daysRemaining} days remaining`,
                            href: `/quotes/${quote.id}`,
                            ctaText: 'View Details'
                        })
                    })
            }
        }

        // Build stats
        const stats = {
            activeQuotes: quotes?.length || 0,
            activeOrders: ordersCount || 0
        }

        return {
            success: true,
            data: {
                verification,
                actionItems,
                stats
            }
        }
    } catch (error: any) {
        console.error('Error fetching business hub data:', error)
        return { success: false, error: error.message || 'Failed to fetch business hub data' }
    }
}

/**
 * Helper function to get human-readable time ago string
 */
function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }
}

