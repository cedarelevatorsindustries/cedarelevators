'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient, createClerkSupabaseClient } from '@/lib/supabase/server'

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

        // Use Admin client for user and business lookups to bypass RLS
        // This ensures we can verify status even if RLS policies are strict
        const adminSupabase = createAdminClient()
        const userSupabase = await createClerkSupabaseClient()

        // First get the user's Supabase ID from users table
        const { data: userData } = await adminSupabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', userId)
            .single()

        if (!userData) {
            return { success: false, error: 'User not found' }
        }

        // Get business verification status from businesses table via business_members
        // This is the source of truth for verification status
        const { data: businessMember } = await adminSupabase
            .from('business_members')
            .select('business:businesses(id, verification_status)')
            .eq('user_id', userData.id)
            .single()

        // Also check if there's a pending verification in business_verifications
        // Using admin client to ensure visibility
        const { data: pendingVerification } = await adminSupabase
            .from('business_verifications')
            .select('status')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        // Fetch active quotes for action items and stats
        const { data: quotes } = await userSupabase
            .from('quotes')
            .select('id, quote_number, status, estimated_total, expires_at, created_at, items:quote_items(id)')
            .eq('clerk_user_id', userId)
            .in('status', ['pending', 'in_review', 'negotiation'])
            .order('created_at', { ascending: false })

        // Fetch active orders count
        const { count: ordersCount } = await userSupabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('clerk_user_id', userId)
            .in('status', ['pending', 'processing', 'confirmed'])

        // Build verification data from the actual business table
        const businessVerificationStatus = (businessMember?.business as any)?.verification_status
        console.log('[BusinessHub] Debug:', {
            userId: userData.id,
            businessMemberFound: !!businessMember,
            businessVerificationStatus,
            pendingStatus: pendingVerification?.status
        })

        const verification = {
            isVerified: businessVerificationStatus === 'verified',
            isPending: pendingVerification?.status === 'pending' || pendingVerification?.status === 'in_review',
            completionPercentage: businessVerificationStatus === 'verified' ? 100 :
                pendingVerification?.status ? 80 : 0
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

