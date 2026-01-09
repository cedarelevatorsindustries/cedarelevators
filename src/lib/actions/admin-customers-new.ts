'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    Customer,
    CustomerStats,
    CustomerFilters,
    CustomerType,
} from '@/types/b2b/customer'

// =====================================================
// GET ALL CUSTOMERS (ADMIN) - REDESIGNED
// =====================================================

export async function getCustomers(
    filters: CustomerFilters,
    page: number = 1,
    limit: number = 20
): Promise<
    | { success: true; customers: Customer[]; total: number }
    | { success: false; error: string }
> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        // CRITICAL: Filter by commercial intent
        // A customer exists only when there is intent or transaction
        // Include users who have:
        // - Quotes
        // - Orders
        // - Business verification submission

        // Get user_profiles with commercial intent
        let query = supabase
            .from('user_profiles')
            .select(`
        *,
        quotes:quotes(count),
        orders:orders(count, total_amount),
        business_verification:business_verifications(
          id,
          status,
          legal_business_name,
          submitted_at
        )
      `, { count: 'exact' })

        // FILTER: Only users with commercial intent
        // This is done via OR conditions in the query
        // Note: Supabase doesn't support OR directly, so we'll filter in memory

        const { data: allProfiles, error: profileError, count: totalCount } = await query

        if (profileError) {
            console.error('Error fetching profiles:', profileError)
            return { success: false, error: profileError.message }
        }

        // Filter to only users with commercial intent
        let filteredProfiles = (allProfiles || []).filter((profile: any) => {
            const hasQuotes = profile.quotes && profile.quotes.length > 0
            const hasOrders = profile.orders && profile.orders.length > 0
            const hasVerification = profile.business_verification && profile.business_verification.length > 0

            return hasQuotes || hasOrders || hasVerification
        })

        // Apply additional filters
        if (filters.account_type && filters.account_type !== 'all') {
            filteredProfiles = filteredProfiles.filter((p: any) =>
                p.account_type === filters.account_type
            )
        }

        if (filters.verification_status && filters.verification_status !== 'all') {
            filteredProfiles = filteredProfiles.filter((p: any) =>
                p.verification_status === filters.verification_status
            )
        }

        if (filters.has_orders !== undefined) {
            filteredProfiles = filteredProfiles.filter((p: any) => {
                const hasOrders = p.orders && p.orders.length > 0
                return filters.has_orders ? hasOrders : !hasOrders
            })
        }

        if (filters.has_quotes !== undefined) {
            filteredProfiles = filteredProfiles.filter((p: any) => {
                const hasQuotes = p.quotes && p.quotes.length > 0
                return filters.has_quotes ? hasQuotes : !hasQuotes
            })
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filteredProfiles = filteredProfiles.filter((p: any) =>
                p.email?.toLowerCase().includes(searchLower) ||
                p.first_name?.toLowerCase().includes(searchLower) ||
                p.last_name?.toLowerCase().includes(searchLower) ||
                p.clerk_user_id?.toLowerCase().includes(searchLower)
            )
        }

        // Calculate customer_type for each profile
        const customersWithType = filteredProfiles.map((profile: any) => {
            const quotesCount = profile.quotes?.[0]?.count || 0
            const ordersCount = profile.orders?.[0]?.count || 0
            const totalRevenue = profile.orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0
            const avgOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0

            const verification = profile.business_verification?.[0]
            const verificationStatus = verification?.status || 'incomplete'

            // Determine customer_type
            let customerType: CustomerType
            if (verificationStatus === 'approved') {
                customerType = 'business'
            } else if (ordersCount > 0) {
                customerType = 'customer'
            } else if (quotesCount > 0) {
                customerType = 'lead'
            } else {
                customerType = 'individual'
            }

            // Calculate last_activity
            const activities = []
            if (profile.quotes?.length > 0) activities.push(new Date(profile.quotes[0].created_at))
            if (profile.orders?.length > 0) activities.push(new Date(profile.orders[0].created_at))
            if (verification?.submitted_at) activities.push(new Date(verification.submitted_at))
            const lastActivity = activities.length > 0
                ? new Date(Math.max(...activities.map(d => d.getTime()))).toISOString()
                : profile.created_at

            return {
                ...profile,
                customer_type: customerType,
                total_quotes: quotesCount,
                total_orders: ordersCount,
                total_spent: totalRevenue,
                average_order_value: avgOrderValue,
                last_activity: lastActivity,
                verification_status: verificationStatus,
            }
        })

        // Apply customer_type filter
        let finalCustomers = customersWithType
        if (filters.customer_type && filters.customer_type !== 'all') {
            finalCustomers = customersWithType.filter((c: any) =>
                c.customer_type === filters.customer_type
            )
        }

        // Sort by last_activity desc
        finalCustomers.sort((a: any, b: any) =>
            new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
        )

        // Apply pagination
        const total = finalCustomers.length
        const from = (page - 1) * limit
        const to = from + limit
        const paginatedCustomers = finalCustomers.slice(from, to)

        // Transform to Customer format
        const customers: Customer[] = paginatedCustomers.map((profile: any) => ({
            id: profile.id,
            clerk_user_id: profile.clerk_user_id,
            email: profile.email || '',
            first_name: profile.first_name,
            last_name: profile.last_name,
            full_name: profile.first_name && profile.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : profile.first_name || profile.last_name || '',
            account_type: profile.account_type || 'individual',
            customer_type: profile.customer_type,
            business_verified: profile.verification_status === 'approved',
            verification_status: profile.verification_status,
            phone: profile.phone,
            total_quotes: profile.total_quotes,
            total_orders: profile.total_orders,
            total_spent: profile.total_spent,
            average_order_value: profile.average_order_value,
            last_activity: profile.last_activity,
            registration_date: profile.created_at,
            status: 'active',
            created_at: profile.created_at,
            updated_at: profile.updated_at,
        }))

        return {
            success: true,
            customers,
            total,
        }
    } catch (error: any) {
        console.error('Error in getCustomers:', error)
        return { success: false, error: error.message || 'Failed to fetch customers' }
    }
}

// =====================================================
// GET CUSTOMER STATS (ADMIN) - REDESIGNED
// =====================================================

export async function getCustomerStats(): Promise<
    | { success: true; stats: CustomerStats }
    | { success: false; error: string }
> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        // Get all profiles with commercial intent
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select(`
        *,
        quotes:quotes(count),
        orders:orders(count, total_amount),
        business_verification:business_verifications(status)
      `)

        // Filter to only users with commercial intent
        const customersWithIntent = (profiles || []).filter((profile: any) => {
            const hasQuotes = profile.quotes && profile.quotes.length > 0
            const hasOrders = profile.orders && profile.orders.length > 0
            const hasVerification = profile.business_verification && profile.business_verification.length > 0
            return hasQuotes || hasOrders || hasVerification
        })

        // Calculate stats
        let leads = 0
        let activeCustomers = 0
        let individualCustomers = 0
        let businessCustomers = 0
        let verifiedBusinesses = 0
        let pendingVerifications = 0
        let totalRevenue = 0

        customersWithIntent.forEach((profile: any) => {
            const quotesCount = profile.quotes?.[0]?.count || 0
            const ordersCount = profile.orders?.[0]?.count || 0
            const verification = profile.business_verification?.[0]
            const verificationStatus = verification?.status || 'incomplete'

            // Customer type classification
            if (verificationStatus === 'approved') {
                verifiedBusinesses++
            } else if (ordersCount > 0) {
                activeCustomers++
            } else if (quotesCount > 0) {
                leads++
            }

            // Account type
            if (profile.account_type === 'business') {
                businessCustomers++
                if (verificationStatus === 'pending') {
                    pendingVerifications++
                }
            } else {
                individualCustomers++
            }

            // Revenue
            const revenue = profile.orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0
            totalRevenue += revenue
        })

        const stats: CustomerStats = {
            total_customers: customersWithIntent.length,
            leads,
            active_customers: activeCustomers,
            individual_customers: individualCustomers,
            business_customers: businessCustomers,
            verified_businesses: verifiedBusinesses,
            pending_verifications: pendingVerifications,
            total_revenue: totalRevenue,
        }

        return { success: true, stats }
    } catch (error: any) {
        console.error('Error in getCustomerStats:', error)
        return { success: false, error: error.message || 'Failed to fetch stats' }
    }
}
