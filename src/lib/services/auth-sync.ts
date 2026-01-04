'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@clerk/nextjs/server'

export interface SupabaseUser {
    id: string
    clerk_user_id: string
    email: string
    phone: string | null
    name: string | null
    created_at: string
    updated_at: string
}

export interface UserProfile {
    id: string
    user_id: string
    profile_type: 'individual' | 'business'
    is_active: boolean
    created_at: string
}

export interface Business {
    id: string
    name: string
    gst_number: string | null
    pan_number: string | null
    verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
    verification_documents: any
    verification_requested_at: string | null
    verified_at: string | null
    verified_by: string | null
    verification_notes: string | null
    company_address: string | null
    contact_person: string | null
    contact_phone: string | null
    created_at: string
    updated_at: string
}

export interface UserWithProfile {
    user: SupabaseUser
    activeProfile: UserProfile
    business?: Business
}

// Import User type
import { User } from '@clerk/nextjs/server'

/**
 * Get or create user in Supabase from Clerk user
 * This is the core sync function that runs on every auth check
 * @param clerkUserId - The Clerk User ID
 * @param clerkUserObj - Optional Clerk User object (if already fetched)
 */
export async function getOrCreateUser(clerkUserId: string, clerkUserObj?: User | null): Promise<SupabaseUser | null> {
    try {
        const supabase = createAdminClient()

        // If user object not provided, fetch it
        const clerkUser = clerkUserObj !== undefined ? clerkUserObj : await currentUser()

        if (!clerkUser) return null

        // Ensure the ID matches if both provided
        if (clerkUserObj && clerkUser.id !== clerkUserId) {
            console.warn('Id mismatch in getOrCreateUser', { provided: clerkUserId, fetched: clerkUser.id })
            return null
        }

        // Try to find existing user
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .single()

        if (existingUser) {
            // Update user info if changed
            const { data: updatedUser } = await supabase
                .from('users')
                .update({
                    email: clerkUser.emailAddresses[0]?.emailAddress || existingUser.email,
                    phone: clerkUser.phoneNumbers[0]?.phoneNumber || existingUser.phone,
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || existingUser.name,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingUser.id)
                .select()
                .single()

            return updatedUser || existingUser
        }

        // Create new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                clerk_user_id: clerkUserId,
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                phone: clerkUser.phoneNumbers[0]?.phoneNumber,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating user:', error)
            return null
        }

        // Create default individual profile
        await supabase
            .from('user_profiles')
            .insert({
                user_id: newUser.id,
                profile_type: 'individual',
                is_active: true
            })

        return newUser
    } catch (error) {
        console.error('Error in getOrCreateUser:', error)
        return null
    }
}

/**
 * Get user's active profile
 */
export async function getActiveProfile(userId: string): Promise<UserProfile | null> {
    try {
        const supabase = createAdminClient()

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single()

        return profile
    } catch (error) {
        console.error('Error getting active profile:', error)
        return null
    }
}

/**
 * Get user with their active profile and business (if applicable)
 * @param clerkUserId - The Clerk User ID
 * @param clerkUserObj - Optional Clerk User object (if already fetched)
 */
export async function getUserWithProfile(clerkUserId: string, clerkUserObj?: User | null): Promise<UserWithProfile | null> {
    try {
        const user = await getOrCreateUser(clerkUserId, clerkUserObj)
        if (!user) return null

        const activeProfile = await getActiveProfile(user.id)
        if (!activeProfile) return null

        let business: Business | undefined

        // If business profile is active, get the business
        if (activeProfile.profile_type === 'business') {
            const supabase = createAdminClient()

            const { data: businessMember } = await supabase
                .from('business_members')
                .select('business_id, businesses(*)')
                .eq('user_id', user.id)
                .single()

            if (businessMember?.businesses) {
                // Supabase returns nested object, not array
                business = businessMember.businesses as unknown as Business
            }
        }

        return {
            user,
            activeProfile,
            business
        }
    } catch (error) {
        console.error('Error in getUserWithProfile:', error)
        return null
    }
}

/**
 * Switch user's active profile
 */
export async function switchProfile(
    userId: string,
    profileType: 'individual' | 'business'
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createAdminClient()

        // Check if profile exists
        const { data: targetProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .eq('profile_type', profileType)
            .single()

        if (!targetProfile) {
            return { success: false, error: `${profileType} profile does not exist` }
        }

        // Deactivate all profiles
        await supabase
            .from('user_profiles')
            .update({ is_active: false })
            .eq('user_id', userId)

        // Activate target profile
        const { error } = await supabase
            .from('user_profiles')
            .update({ is_active: true })
            .eq('id', targetProfile.id)

        if (error) {
            console.error('Error switching profile:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in switchProfile:', error)
        return { success: false, error: error.message || 'Failed to switch profile' }
    }
}

/**
 * Create business profile for user
 */
export async function createBusinessProfile(
    userId: string,
    businessData: {
        name: string
        gst_number?: string
        pan_number?: string
    }
): Promise<{ success: boolean; businessId?: string; error?: string }> {
    try {
        const supabase = createAdminClient()

        // Check if business profile already exists
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .eq('profile_type', 'business')
            .single()

        if (existingProfile) {
            return { success: false, error: 'Business profile already exists' }
        }

        // Create business entity
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .insert({
                name: businessData.name,
                gst_number: businessData.gst_number,
                pan_number: businessData.pan_number,
                verification_status: 'unverified'
            })
            .select()
            .single()

        if (businessError || !business) {
            console.error('Error creating business:', businessError)
            return { success: false, error: 'Failed to create business' }
        }

        // Create business member link
        await supabase
            .from('business_members')
            .insert({
                business_id: business.id,
                user_id: userId,
                role: 'owner'
            })

        // Deactivate individual profile
        await supabase
            .from('user_profiles')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('profile_type', 'individual')

        // Create and activate business profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: userId,
                profile_type: 'business',
                is_active: true // Auto-activate business profile
            })

        if (profileError) {
            console.error('Error creating business profile:', profileError)
            return { success: false, error: 'Failed to create business profile' }
        }

        return { success: true, businessId: business.id }
    } catch (error: any) {
        console.error('Error in createBusinessProfile:', error)
        return { success: false, error: error.message || 'Failed to create business profile' }
    }
}

/**
 * Get user's business (if they have one)
 */
export async function getUserBusiness(userId: string): Promise<Business | null> {
    try {
        const supabase = createAdminClient()

        const { data: businessMember } = await supabase
            .from('business_members')
            .select('businesses(*)')
            .eq('user_id', userId)
            .eq('role', 'owner')
            .single()

        // Supabase returns nested object, not array
        return (businessMember?.businesses as unknown as Business) || null
    } catch (error) {
        console.error('Error getting user business:', error)
        return null
    }
}

/**
 * Check if user has business profile
 */
export async function hasBusinessProfile(userId: string): Promise<boolean> {
    try {
        const supabase = createAdminClient()

        const { data } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', userId)
            .eq('profile_type', 'business')
            .single()

        return !!data
    } catch (error) {
        return false
    }
}

