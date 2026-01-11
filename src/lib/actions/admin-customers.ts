'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  Customer,
  CustomerStats,
  CustomerFilters,
  VerificationDocument,
  VerificationAuditLog,
  CustomerNote,
  BusinessProfile,
  VerificationStatus,
  DocumentStatus,
  VerificationActionType,
} from '@/types/b2b/customer'
import { getCurrentAdminUser, canApproveVerification } from '@/lib/auth/admin-roles'

// =====================================================
// AUDIT LOG HELPER
// =====================================================

async function logVerificationAction(
  customerClerkId: string,
  businessProfileId: string | undefined,
  actionType: VerificationActionType,
  details: {
    oldStatus?: VerificationStatus
    newStatus?: VerificationStatus
    notes?: string
    metadata?: Record<string, any>
  } = {}
): Promise<void> {
  // TODO: verification_audit_log table doesn't exist yet
  // Stubbed out for now
  return Promise.resolve()
}

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

    // CRITICAL: Filter by commercial intent
    // A customer exists only when there is intent or transaction

    // Fetch user_profiles and business_verifications separately (no FK relationship)
    const { data: allProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')

    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      return { success: false, error: profileError.message }
    }

    // Fetch business verifications separately (correct column names from schema)
    const { data: allVerifications, error: verificationError } = await supabase
      .from('business_verifications')
      .select('id, user_id, status, legal_business_name, created_at')

    if (verificationError) {
      console.error('Error fetching verifications:', verificationError)
      return { success: false, error: verificationError.message }
    }

    // Create verification map by user_id
    const verificationMap = new Map()
    allVerifications?.forEach((v: any) => {
      if (!verificationMap.has(v.user_id)) {
        verificationMap.set(v.user_id, [])
      }
      verificationMap.get(v.user_id).push(v)
    })

    // Attach verifications to profiles
    const profilesWithVerifications = (allProfiles || []).map((profile: any) => ({
      ...profile,
      business_verification: verificationMap.get(profile.id) || []
    }))

    console.log('=== CUSTOMERS DEBUG ===')
    console.log('Total profiles:', profilesWithVerifications.length)
    console.log('Total verifications:', allVerifications?.length || 0)

    // Filter to only users with commercial intent
    let filteredProfiles = profilesWithVerifications.filter((profile: any) => {
      const hasVerification = profile.business_verification && profile.business_verification.length > 0
      return hasVerification
    })

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
        p.last_name?.toLowerCase().includes(searchLower)
      )
    }

    // Calculate customer_type for each profile
    const customersWithType = filteredProfiles.map((profile: any) => {
      // We don't have quotes/orders data in this simplified approach
      const quotesCount = 0
      const ordersCount = 0
      const totalRevenue = 0
      const avgOrderValue = 0

      const verification = profile.business_verification?.[0]
      const verificationStatus = verification?.status || 'incomplete'

      // Determine customer_type based on verification
      let customerType: 'lead' | 'customer' | 'business' | 'individual'
      if (verificationStatus === 'approved') {
        customerType = 'business'
      } else if (verificationStatus === 'pending') {
        customerType = 'lead'
      } else {
        customerType = 'individual'
      }

      // Calculate last_activity using created_at (not submitted_at which doesn't exist)
      const activities = []
      if (profile.created_at) activities.push(new Date(profile.created_at))
      if (profile.updated_at) activities.push(new Date(profile.updated_at))
      if (verification?.created_at) activities.push(new Date(verification.created_at))
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

    // Create verification map
    const verificationMap = new Map()
    verifications?.forEach((v: any) => {
      if (!verificationMap.has(v.user_id)) {
        verificationMap.set(v.user_id, [])
      }
      verificationMap.get(v.user_id).push(v)
    })

    // Attach verifications to profiles
    const profilesWithVerifications = (profiles || []).map((profile: any) => ({
      ...profile,
      business_verification: verificationMap.get(profile.id) || []
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

// =====================================================
// APPROVE VERIFICATION (ADMIN ONLY)
// =====================================================

export async function approveVerification(
  businessProfileId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Permission check
    // const canApprove = await canApproveVerification()
    // if (!canApprove) {
    //   return { success: false, error: 'Insufficient permissions to approve verifications' }
    // }

    const supabase = createAdminClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', businessProfileId)
      .single()

    if (fetchError || !profile) {
      return { success: false, error: 'Business profile not found' }
    }

    // Check if profile is in pending status
    if (profile.verification_status !== 'pending') {
      return { success: false, error: 'Only pending verifications can be approved' }
    }

    const adminUser = await getCurrentAdminUser()

    // Update verification status
    const { error: updateError } = await supabase
      .from('business_profiles')
      .update({
        verification_status: 'verified',
        verified_by: adminUser?.clerk_user_id,
        verified_at: new Date().toISOString(),
        verification_notes: notes,
        last_verification_check_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessProfileId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Update customer_meta
    await supabase
      .from('customer_meta')
      .update({ business_verified: true })
      .eq('clerk_user_id', profile.clerk_user_id)

    // Log the action
    await logVerificationAction(
      profile.clerk_user_id,
      businessProfileId,
      'verification_approved',
      {
        oldStatus: profile.verification_status,
        newStatus: 'verified',
        notes,
        metadata: {
          company_name: profile.company_name,
        },
      }
    )

    // Send verification approved email
    try {
      const { sendVerificationStatus } = await import('@/lib/services/email')
      // Get the user's email from the profile or business profile if stored there
      // Since we don't have the user's email directly in the business profile, we might need to fetch it
      // For now, checking if we can get it from the profile data or if we need to fetch the user

      const { data: userData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('clerk_user_id', profile.clerk_user_id)
        .single()

      if (userData?.email) {
        await sendVerificationStatus(userData.email, 'approved', profile.company_name, notes)
        console.log('Sent verification approved email to:', userData.email)
      } else {
        console.warn('Could not find user email to send verification notification')
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail the entire operation if email fails
    }

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${profile.clerk_user_id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error in approveVerification:', error)
    return { success: false, error: error.message || 'Failed to approve verification' }
  }
}

// =====================================================
// REJECT VERIFICATION (ADMIN ONLY)
// =====================================================

export async function rejectVerification(
  businessProfileId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Permission check
    // const canApprove = await canApproveVerification()
    // if (!canApprove) {
    //   return { success: false, error: 'Insufficient permissions to reject verifications' }
    // }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Rejection reason is required' }
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', businessProfileId)
      .single()

    if (fetchError || !profile) {
      return { success: false, error: 'Business profile not found' }
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('business_profiles')
      .update({
        verification_status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason, // Ensure this column exists in DB, otherwise might fail
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessProfileId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Log the action
    await logVerificationAction(
      profile.clerk_user_id,
      businessProfileId,
      'verification_rejected',
      {
        oldStatus: profile.verification_status,
        newStatus: 'rejected',
        notes: reason,
        metadata: {
          company_name: profile.company_name,
        },
      }
    )

    // Send verification rejected email
    try {
      const { sendVerificationStatus } = await import('@/lib/services/email')

      const { data: userData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('clerk_user_id', profile.clerk_user_id)
        .single()

      if (userData?.email) {
        await sendVerificationStatus(userData.email, 'rejected', profile.company_name, reason)
        console.log('Sent verification rejected email to:', userData.email)
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
    }

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${profile.clerk_user_id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error in rejectVerification:', error)
    return { success: false, error: error.message || 'Failed to reject verification' }
  }
}


// =====================================================
// REQUEST MORE DOCUMENTS (ADMIN ONLY)
// =====================================================

export async function requestMoreDocuments(
  businessProfileId: string,
  documentTypes: string[],
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Permission check
    const canApprove = await canApproveVerification()
    if (!canApprove) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', businessProfileId)
      .single()

    if (fetchError || !profile) {
      return { success: false, error: 'Business profile not found' }
    }

    // Update verification notes
    const { error: updateError } = await supabase
      .from('business_profiles')
      .update({
        verification_notes: message,
        last_verification_check_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessProfileId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Log the action
    await logVerificationAction(
      profile.clerk_user_id,
      businessProfileId,
      'more_documents_requested',
      {
        notes: message,
        metadata: {
          requested_documents: documentTypes,
          company_name: profile.company_name,
        },
      }
    )

    revalidatePath(`/admin/customers/${profile.clerk_user_id}`)

    // Send email notification to customer via Resend
    try {
      // Note: In production, fetch actual email from Clerk API
      // For now, this is a placeholder - email would come from customer record
      console.log('Sending more documents request email to customer:', profile.clerk_user_id)
      // const { Resend } = await import('resend')
      // const resend = new Resend(process.env.RESEND_API_KEY)
      // await resend.emails.send({
      //   from: 'Cedar Elevators <noreply@cedarelevators.com>',
      //   to: customerEmail,
      //   subject: 'Additional Documents Required - Cedar Elevators',
      //   html: `...email template...`
      // })
    } catch (emailError) {
      console.error('Error sending document request email:', emailError)
      // Don't fail the operation if email fails
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in requestMoreDocuments:', error)
    return { success: false, error: error.message || 'Failed to request documents' }
  }
}

// =====================================================
// APPROVE DOCUMENT (ADMIN ONLY)
// =====================================================

export async function approveDocument(
  documentId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const canApprove = await canApproveVerification()
    if (!canApprove) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    const adminUser = await getCurrentAdminUser()

    // Update document status
    const { data: document, error: updateError } = await supabase
      .from('verification_documents')
      .update({
        status: 'approved',
        reviewed_by: adminUser?.clerk_user_id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Log the action
    await logVerificationAction(
      document.customer_clerk_id,
      document.business_profile_id,
      'document_approved',
      {
        notes,
        metadata: {
          document_type: document.document_type,
          document_id: documentId,
        },
      }
    )

    revalidatePath(`/admin/customers/${document.customer_clerk_id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error in approveDocument:', error)
    return { success: false, error: error.message || 'Failed to approve document' }
  }
}

// =====================================================
// REJECT DOCUMENT (ADMIN ONLY)
// =====================================================

export async function rejectDocument(
  documentId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const canApprove = await canApproveVerification()
    if (!canApprove) {
      return { success: false, error: 'Insufficient permissions' }
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Rejection reason is required' }
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    const adminUser = await getCurrentAdminUser()

    // Update document status
    const { data: document, error: updateError } = await supabase
      .from('verification_documents')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: adminUser?.clerk_user_id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Log the action
    await logVerificationAction(
      document.customer_clerk_id,
      document.business_profile_id,
      'document_rejected',
      {
        notes: reason,
        metadata: {
          document_type: document.document_type,
          document_id: documentId,
        },
      }
    )

    revalidatePath(`/admin/customers/${document.customer_clerk_id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error in rejectDocument:', error)
    return { success: false, error: error.message || 'Failed to reject document' }
  }
}

// =====================================================
// GET VERIFICATION AUDIT LOG
// =====================================================

export async function getVerificationAuditLog(
  customerClerkId: string
): Promise<
  | { success: true; logs: VerificationAuditLog[] }
  | { success: false; error: string }
> {
  try {
    // TODO: verification_audit_log table doesn't exist yet
    // Return empty array for now
    return { success: true, logs: [] }
  } catch (error: any) {
    console.error('Error in getVerificationAuditLog:', error)
    return { success: false, error: error.message || 'Failed to fetch audit log' }
  }
}

// =====================================================
// GET CUSTOMER NOTES
// =====================================================

export async function getCustomerNotes(
  customerClerkId: string
): Promise<
  | { success: true; notes: CustomerNote[] }
  | { success: false; error: string }
> {
  try {
    // TODO: customer_notes table doesn't exist yet
    // Return empty array for now
    return { success: true, notes: [] }
  } catch (error: any) {
    console.error('Error in getCustomerNotes:', error)
    return { success: false, error: error.message || 'Failed to fetch notes' }
  }
}

// =====================================================
// ADD CUSTOMER NOTE
// =====================================================

export async function addCustomerNote(
  customerClerkId: string,
  noteText: string,
  isImportant: boolean = false
): Promise<{ success: boolean; note?: CustomerNote; error?: string }> {
  try {
    if (!noteText || noteText.trim().length === 0) {
      return { success: false, error: 'Note text is required' }
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return { success: false, error: 'Database connection failed' }
    }

    const adminUser = await getCurrentAdminUser()

    const { data: note, error } = await supabase
      .from('customer_notes')
      .insert({
        customer_clerk_id: customerClerkId,
        admin_clerk_id: adminUser?.clerk_user_id || 'unknown',
        admin_name: adminUser?.full_name || 'Admin',
        note_text: noteText,
        is_important: isImportant,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding customer note:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/admin/customers/${customerClerkId}`)

    return { success: true, note: note as CustomerNote }
  } catch (error: any) {
    console.error('Error in addCustomerNote:', error)
    return { success: false, error: error.message || 'Failed to add note' }
  }
}

// =====================================================
// EXPORT CUSTOMERS
// =====================================================

export async function exportCustomersAction(filters: CustomerFilters): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const result = await getCustomers(filters, 1, 10000)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Transform customers to export format
    const exportData = result.customers.map(customer => ({
      'Customer ID': customer.id,
      'Email': customer.email,
      'Account Type': customer.account_type,
      'Verification Status': customer.verification_status || 'N/A',
      'Phone': customer.phone || 'N/A',
      'Total Orders': customer.total_orders,
      'Total Spent': customer.total_spent,
      'Registration Date': new Date(customer.registration_date).toLocaleDateString(),
      'Status': customer.status,
    }))

    return { success: true, data: exportData }
  } catch (error: any) {
    console.error('Error in exportCustomersAction:', error)
    return { success: false, error: error.message || 'Failed to export customers' }
  }
}


