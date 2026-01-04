'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { sendVerificationStatus } from '@/lib/services/email'

export async function createBusinessProfile(data: {
  companyName: string
  companyType: string
  gstNumber?: string
  panNumber?: string
  tanNumber?: string
  businessAddress: any
  billingAddress?: any
  phone: string
  website?: string
  annualRevenue?: string
  employeeCount?: string
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .insert({
        clerk_user_id: userId,
        company_name: data.companyName,
        company_type: data.companyType,
        gst_number: data.gstNumber,
        pan_number: data.panNumber,
        tan_number: data.tanNumber,
        business_address: data.businessAddress,
        billing_address: data.billingAddress || data.businessAddress,
        phone: data.phone,
        website: data.website,
        annual_revenue: data.annualRevenue,
        employee_count: data.employeeCount,
        verification_status: 'unverified',
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating business profile:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, profile }
  } catch (error: any) {
    console.error('Error in createBusinessProfile:', error)
    return { success: false, error: error.message || 'Failed to create business profile' }
  }
}

export async function updateBusinessProfile(
  updates: {
    companyName?: string
    companyType?: string
    gstNumber?: string
    panNumber?: string
    tanNumber?: string
    businessAddress?: any
    billingAddress?: any
    phone?: string
    website?: string
    annualRevenue?: string
    employeeCount?: string
  }
) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {}
    if (updates.companyName) dbUpdates.company_name = updates.companyName
    if (updates.companyType) dbUpdates.company_type = updates.companyType
    if (updates.gstNumber) dbUpdates.gst_number = updates.gstNumber
    if (updates.panNumber) dbUpdates.pan_number = updates.panNumber
    if (updates.tanNumber) dbUpdates.tan_number = updates.tanNumber
    if (updates.businessAddress) dbUpdates.business_address = updates.businessAddress
    if (updates.billingAddress) dbUpdates.billing_address = updates.billingAddress
    if (updates.phone) dbUpdates.phone = updates.phone
    if (updates.website) dbUpdates.website = updates.website
    if (updates.annualRevenue) dbUpdates.annual_revenue = updates.annualRevenue
    if (updates.employeeCount) dbUpdates.employee_count = updates.employeeCount
    
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .update(dbUpdates)
      .eq('clerk_user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating business profile:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, profile }
  } catch (error: any) {
    console.error('Error in updateBusinessProfile:', error)
    return { success: false, error: error.message || 'Failed to update business profile' }
  }
}

export async function uploadBusinessDocument(data: {
  documentType: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Get business profile
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()
    
    if (!profile) {
      return { success: false, error: 'Business profile not found. Please create a profile first.' }
    }
    
    // Upload document
    const { data: document, error } = await supabase
      .from('business_documents')
      .insert({
        business_profile_id: profile.id,
        document_type: data.documentType,
        file_name: data.fileName,
        file_url: data.fileUrl,
        file_size: data.fileSize,
        mime_type: data.mimeType,
        status: 'pending',
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error uploading business document:', error)
      return { success: false, error: error.message }
    }
    
    // Update profile status to pending verification if not already
    await supabase
      .from('business_profiles')
      .update({ verification_status: 'pending' })
      .eq('id', profile.id)
      .eq('verification_status', 'unverified')
    
    return { success: true, document }
  } catch (error: any) {
    console.error('Error in uploadBusinessDocument:', error)
    return { success: false, error: error.message || 'Failed to upload document' }
  }
}

export async function getBusinessProfile() {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select(`
        *,
        documents:business_documents(*)
      `)
      .eq('clerk_user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, not an error
        return { success: true, profile: null }
      }
      console.error('Error fetching business profile:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, profile }
  } catch (error: any) {
    console.error('Error in getBusinessProfile:', error)
    return { success: false, error: error.message || 'Failed to fetch business profile' }
  }
}

export async function deleteBusinessDocument(documentId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Verify document belongs to user's business profile
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()
    
    if (!profile) {
      return { success: false, error: 'Business profile not found' }
    }
    
    const { error } = await supabase
      .from('business_documents')
      .delete()
      .eq('id', documentId)
      .eq('business_profile_id', profile.id)
    
    if (error) {
      console.error('Error deleting business document:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteBusinessDocument:', error)
    return { success: false, error: error.message || 'Failed to delete document' }
  }
}

// ============================================
// ADMIN FUNCTIONS (for business verification)
// ============================================

export async function verifyBusiness(
  profileId: string,
  status: 'verified' | 'rejected',
  notes?: string
) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // TODO: Add admin role check here
    // const { data: adminProfile } = await supabase
    //   .from('admin_profiles')
    //   .select('role, is_active')
    //   .eq('user_id', userId)
    //   .single()
    // 
    // if (!adminProfile || !adminProfile.is_active) {
    //   return { success: false, error: 'Admin access required' }
    // }
    
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .update({
        verification_status: status,
        verification_notes: notes,
        verified_by: userId,
        verified_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .select('clerk_user_id, company_name')
      .single()
    
    if (error) {
      console.error('Error verifying business:', error)
      return { success: false, error: error.message }
    }
    
    // Send email notification to business owner
    try {
      // Import Clerk to get user email
      const { clerkClient } = await import('@clerk/nextjs/server')
      const user = await (await clerkClient()).users.getUser(profile.clerk_user_id)
      
      if (user.primaryEmailAddress?.emailAddress) {
        const { sendVerificationStatus } = await import('@/lib/services/email')
        await sendVerificationStatus(
          user.primaryEmailAddress.emailAddress,
          status === 'verified' ? 'approved' : 'rejected',
          profile.company_name,
          notes
        )
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail the verification if email fails
    }
    
    return { success: true, profile }
  } catch (error: any) {
    console.error('Error in verifyBusiness:', error)
    return { success: false, error: error.message || 'Failed to verify business' }
  }
}

export async function fetchBusinessProfiles(filters?: {
  status?: string
  search?: string
  limit?: number
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // TODO: Add admin role check here
    
    let query = supabase
      .from('business_profiles')
      .select(`
        *,
        documents:business_documents(count)
      `)
      .order('created_at', { ascending: false })
    
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('verification_status', filters.status)
    }
    
    if (filters?.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,gst_number.ilike.%${filters.search}%`)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    const { data: profiles, error } = await query
    
    if (error) {
      console.error('Error fetching business profiles:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, profiles }
  } catch (error: any) {
    console.error('Error in fetchBusinessProfiles:', error)
    return { success: false, error: error.message || 'Failed to fetch business profiles' }
  }
}

export async function getBusinessProfileById(profileId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // TODO: Add admin role check here
    
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select(`
        *,
        documents:business_documents(*)
      `)
      .eq('id', profileId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Business profile not found' }
      }
      console.error('Error fetching business profile:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, profile }
  } catch (error: any) {
    console.error('Error in getBusinessProfileById:', error)
    return { success: false, error: error.message || 'Failed to fetch business profile' }
  }
}

