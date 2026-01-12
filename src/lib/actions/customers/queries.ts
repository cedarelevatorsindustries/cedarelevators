'use server'

import { createAdminClient } from '@/lib/supabase/server'
import {
    Customer,
    CustomerStats,
    CustomerFilters,
    VerificationDocument,
    BusinessProfile,
} from '@/types/b2b/customer'

// =====================================================
// GET ALL CUSTOMERS (ADMIN)
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
        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        // CUSTOMER DEFINITION:
        // 1. Anyone who sent a quote request (quotes.user_id is the clerk_user_id)
        // 2. Anyone who submitted business verification

        // Fetch all quotes to identify customers
        const { data: allQuotes, error: quotesError } = await supabase
            .from('quotes')
            .select('user_id, guest_email, guest_name, guest_phone, account_type, status, estimated_total, created_at, updated_at')

        if (quotesError) {
            console.error('Error fetching quotes:', quotesError)
            return { success: false, error: quotesError.message }
        }

        // Fetch all orders
        const { data: allOrders } = await supabase
            .from('orders')
            .select('clerk_user_id, total_amount, status, created_at')

        // Fetch business verifications
        const { data: allVerifications } = await supabase
            .from('business_verifications')
            .select('user_id, status, legal_business_name, created_at, updated_at')

        // Fetch users to map users.id (UUID) -> clerk_user_id
        const { data: allUsers } = await supabase
            .from('users')
            .select('id, clerk_user_id, email, name')

        // Create user maps
        const usersByUuid = new Map<string, any>()
        const usersByClerkId = new Map<string, any>()
        allUsers?.forEach((u: any) => {
            usersByUuid.set(u.id, u)
            usersByClerkId.set(u.clerk_user_id, u)
        })

        // Build customer map keyed by clerk_user_id
        const customerMap = new Map<string, any>()

        // Add customers from quotes (only logged-in users have user_id)
        allQuotes?.forEach((quote: any) => {
            const clerkUserId = quote.user_id
            if (!clerkUserId) return // Skip guest quotes

            if (!customerMap.has(clerkUserId)) {
                const userData = usersByClerkId.get(clerkUserId)
                customerMap.set(clerkUserId, {
                    clerk_user_id: clerkUserId,
                    email: quote.guest_email || userData?.email || '',
                    name: quote.guest_name || userData?.name || '',
                    phone: quote.guest_phone || '',
                    account_type: quote.account_type || 'individual',
                    quotes: [],
                    orders: [],
                    verification: null,
                    last_activity: quote.created_at,
                    created_at: quote.created_at
                })
            }
            customerMap.get(clerkUserId).quotes.push(quote)
            const customer = customerMap.get(clerkUserId)
            if (new Date(quote.updated_at || quote.created_at) > new Date(customer.last_activity)) {
                customer.last_activity = quote.updated_at || quote.created_at
            }
        })

        // Add customers from business verifications
        allVerifications?.forEach((verification: any) => {
            const userData = usersByUuid.get(verification.user_id)
            const clerkUserId = userData?.clerk_user_id
            if (!clerkUserId) return

            if (!customerMap.has(clerkUserId)) {
                customerMap.set(clerkUserId, {
                    clerk_user_id: clerkUserId,
                    email: userData?.email || '',
                    name: verification.legal_business_name || userData?.name || '',
                    phone: '',
                    account_type: 'business',
                    quotes: [],
                    orders: [],
                    verification: verification,
                    last_activity: verification.updated_at || verification.created_at,
                    created_at: verification.created_at
                })
            } else {
                const customer = customerMap.get(clerkUserId)
                customer.verification = verification
                customer.account_type = 'business'
                if (verification.legal_business_name) customer.name = verification.legal_business_name
            }
        })

        // Add orders to customers
        allOrders?.forEach((order: any) => {
            const clerkUserId = order.clerk_user_id
            if (clerkUserId && customerMap.has(clerkUserId)) {
                customerMap.get(clerkUserId).orders.push(order)
            }
        })

        // Convert to array and calculate stats
        let filteredProfiles = Array.from(customerMap.values()).map((c: any) => {
            const totalQuotes = c.quotes.length
            const totalOrders = c.orders.length
            const totalRevenue = c.orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0), 0)
            const verificationStatus = c.verification?.status || null

            let customerType: 'lead' | 'customer' | 'business' | 'individual'
            if (totalOrders > 0) customerType = 'customer'
            else if (c.account_type === 'business') customerType = 'business'
            else if (totalQuotes > 0) customerType = 'lead'
            else customerType = 'individual'

            return {
                id: c.clerk_user_id,
                clerk_user_id: c.clerk_user_id,
                email: c.email,
                first_name: c.name?.split(' ')[0] || '',
                last_name: c.name?.split(' ').slice(1).join(' ') || '',
                full_name: c.name || '',
                account_type: c.account_type,
                customer_type: customerType,
                business_verified: verificationStatus === 'approved',
                verification_status: verificationStatus,
                phone: c.phone,
                total_quotes: totalQuotes,
                total_orders: totalOrders,
                total_spent: totalRevenue,
                average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                last_activity: c.last_activity,
                registration_date: c.created_at,
                status: 'active',
                created_at: c.created_at,
                updated_at: c.last_activity,
            }
        })

        console.log('=== CUSTOMERS DEBUG ===')
        console.log('Total quotes:', allQuotes?.length || 0)
        console.log('Total verifications:', allVerifications?.length || 0)
        console.log('Total customers:', filteredProfiles.length)

        console.log('Profiles with commercial intent:', filteredProfiles.length)

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

        if (filters.customer_type && filters.customer_type !== 'all') {
            filteredProfiles = filteredProfiles.filter((p: any) =>
                p.customer_type === filters.customer_type
            )
        }

        if (filters.has_orders !== undefined) {
            filteredProfiles = filteredProfiles.filter((p: any) =>
                filters.has_orders ? p.total_orders > 0 : p.total_orders === 0
            )
        }

        if (filters.has_quotes !== undefined) {
            filteredProfiles = filteredProfiles.filter((p: any) =>
                filters.has_quotes ? p.total_quotes > 0 : p.total_quotes === 0
            )
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filteredProfiles = filteredProfiles.filter((p: any) =>
                p.email?.toLowerCase().includes(searchLower) ||
                p.full_name?.toLowerCase().includes(searchLower) ||
                p.first_name?.toLowerCase().includes(searchLower) ||
                p.last_name?.toLowerCase().includes(searchLower)
            )
        }

        // Sort by last_activity desc
        filteredProfiles.sort((a: any, b: any) =>
            new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
        )

        // Apply pagination
        const total = filteredProfiles.length
        const from = (page - 1) * limit
        const paginatedCustomers = filteredProfiles.slice(from, from + limit)

        return {
            success: true,
            customers: paginatedCustomers as Customer[],
            total,
        }
    } catch (error: any) {
        console.error('Error in getCustomers:', error)
        return { success: false, error: error.message || 'Failed to fetch customers' }
    }
}


// =====================================================
// GET SINGLE CUSTOMER (ADMIN)
// =====================================================

export async function getCustomerById(
    customerClerkId: string
): Promise<
    | { success: true; customer: Customer | null }
    | { success: false; error: string }
> {
    try {
        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        // Get user profiles by clerk_user_id (there might be multiple - individual and business)
        const { data: userProfiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('clerk_user_id', customerClerkId)

        if (profileError || !userProfiles || userProfiles.length === 0) {
            console.error('Error fetching user profile:', profileError)
            return { success: false, error: 'User profile not found' }
        }

        // Prefer business profile if it exists, otherwise use the first one
        const userProfile = userProfiles.find(p => p.account_type === 'business') || userProfiles[0]

        // Get business verification if exists
        const { data: businessVerifications } = await supabase
            .from('business_verifications')
            .select('*')
            .eq('user_id', userProfile.id)

        const businessVerification = businessVerifications?.[0]

        // Get orders (these use clerk_user_id or user_id - check your schema)
        const { data: orders } = await supabase
            .from('orders')
            .select(`
        *,
        order_items:order_items(*)
      `)
            .eq('user_id', customerClerkId)
            .order('created_at', { ascending: false })

        // Get quotes
        const { data: quotes } = await supabase
            .from('quotes')
            .select('*')
            .eq('user_id', customerClerkId)
            .order('created_at', { ascending: false })

        // Calculate stats
        const totalQuotes = quotes?.length || 0
        const totalOrders = orders?.length || 0
        const totalSpent = orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
        const lastOrderDate = orders && orders.length > 0 ? orders[0].created_at : null

        const customer: Customer = {
            id: userProfile.id,
            clerk_user_id: customerClerkId,
            email: userProfile.email || '',
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            full_name: userProfile.first_name && userProfile.last_name
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : userProfile.first_name || userProfile.last_name || '',
            account_type: userProfile.account_type || 'individual',
            customer_type: businessVerification?.status === 'approved' ? 'business' : 'lead',
            business_verified: businessVerification?.status === 'approved',
            verification_status: businessVerification?.status,
            phone: userProfile.phone,
            total_quotes: totalQuotes,
            total_orders: totalOrders,
            total_spent: totalSpent,
            average_order_value: averageOrderValue,
            last_order_date: lastOrderDate,
            last_activity: userProfile.updated_at || userProfile.created_at,
            registration_date: userProfile.created_at,
            status: 'active',
            created_at: userProfile.created_at,
            updated_at: userProfile.updated_at,
            orders: orders || [],
            quotes: quotes || [],
            business_profile: businessVerification ? {
                id: businessVerification.id,
                clerk_user_id: customerClerkId,
                user_id: businessVerification.user_id,
                legal_business_name: businessVerification.legal_business_name,
                company_name: businessVerification.legal_business_name,
                contact_person_name: businessVerification.contact_person_name,
                contact_person_phone: businessVerification.contact_person_phone,
                gst_number: businessVerification.gst_number || businessVerification.gstin,
                gstin: businessVerification.gstin,
                pan_number: businessVerification.pan_number,
                verification_status: businessVerification.status,
                created_at: businessVerification.created_at,
                updated_at: businessVerification.updated_at,
                verification_notes: businessVerification.verification_notes,
                verified_at: businessVerification.verified_at,
                verified_by: businessVerification.verified_by,
                rejected_at: businessVerification.rejected_at,
            } as BusinessProfile : undefined,
        }

        return { success: true, customer }
    } catch (error: any) {
        console.error('Error in getCustomerById:', error)
        return { success: false, error: error.message || 'Failed to fetch customer' }
    }
}

// =====================================================
// GET CUSTOMER STATS (ADMIN)
// =====================================================

export async function getCustomerStats(): Promise<
    | { success: true; stats: CustomerStats }
    | { success: false; error: string }
> {
    try {
        const supabase = createAdminClient()
        if (!supabase) {
            return { success: false, error: 'Database connection failed' }
        }

        // Fetch profiles and verifications separately
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('*')

        const { data: verifications } = await supabase
            .from('business_verifications')
            .select('user_id, status')

        // Create verification map by user_id
        // Both business_verifications.user_id and user_profiles.user_id reference users.id
        const verificationMap = new Map()
        verifications?.forEach((v: any) => {
            if (!verificationMap.has(v.user_id)) {
                verificationMap.set(v.user_id, [])
            }
            verificationMap.get(v.user_id).push(v)
        })

        // Attach verifications to profiles using user_id
        const profilesWithVerifications = (profiles || []).map((profile: any) => ({
            ...profile,
            business_verification: verificationMap.get(profile.user_id) || []
        }))

        // Filter to only users with commercial intent
        const customersWithIntent = profilesWithVerifications.filter((profile: any) => {
            const hasVerification = profile.business_verification && profile.business_verification.length > 0
            return hasVerification
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
            const verification = profile.business_verification?.[0]
            const verificationStatus = verification?.status || 'incomplete'

            // Customer type classification
            if (verificationStatus === 'approved') {
                verifiedBusinesses++
                businessCustomers++
            } else if (verificationStatus === 'pending') {
                leads++
                businessCustomers++
                pendingVerifications++
            } else {
                individualCustomers++
            }
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

// =====================================================
// GET VERIFICATION DOCUMENTS
// =====================================================

export async function getVerificationDocuments(
    customerClerkId: string
): Promise<
    | { success: true; documents: VerificationDocument[] }
    | { success: false; error: string }
> {
    try {
        // TODO: verification_documents table doesn't exist yet
        // Return empty array for now
        return { success: true, documents: [] }
    } catch (error: any) {
        console.error('Error in getVerificationDocuments:', error)
        return { success: false, error: error.message || 'Failed to fetch documents' }
    }
}
