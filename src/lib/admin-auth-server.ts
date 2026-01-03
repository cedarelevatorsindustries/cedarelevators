import { createServerSupabase } from './supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminProfile, type AdminProfile, type AdminSettings, type AdminRole } from './admin-auth-client'
import crypto from 'crypto'
import { sendAdminInviteEmail } from './services/email'

/**
 * Check if admin setup is completed (server-only)
 */
export async function isSetupCompleted(): Promise<boolean> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('admin_settings' as any)
            .select('setup_completed')
            .single()

        if (error) {
            console.error('Error checking setup status:', error)
            return false
        }

        return (data as any)?.setup_completed || false
    } catch (error) {
        console.error('Error in isSetupCompleted:', error)
        return false
    }
}

/**
 * Get current admin user (server-only)
 */
export async function getCurrentAdmin(): Promise<{
    user: any
    profile: AdminProfile | null
} | null> {
    try {
        const supabase = await createServerSupabase()

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return null
        }

        const profile = await getAdminProfile(user.id)

        return { user, profile }
    } catch (error) {
        console.error('Error getting current admin:', error)
        return null
    }
}

/**
 * Create admin user using service role (server-only)
 * This bypasses RLS policies
 */
export async function createAdminUser(
    email: string,
    password: string,
    role: AdminRole,
    createdBy: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!serviceRoleKey) {
            return { success: false, error: 'Service role key not configured' }
        }

        // Create Supabase admin client with service role
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'admin',
                is_admin: true
            }
        })

        if (authError || !authData.user) {
            console.error('Error creating auth user:', authError)
            return { success: false, error: authError?.message || 'Failed to create user' }
        }

        // Create admin profile
        const { error: profileError } = await supabaseAdmin
            .from('admin_profiles')
            .insert({
                user_id: authData.user.id,
                role,
                is_active: role === 'super_admin' ? true : false, // Super admin is active immediately, others require approval
                approved_by: role === 'super_admin' ? authData.user.id : createdBy,
                approved_at: role === 'super_admin' ? new Date().toISOString() : null
            })

        if (profileError) {
            console.error('Error creating admin profile:', profileError)
            // Rollback: delete auth user
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return { success: false, error: 'Failed to create admin profile' }
        }

        return { success: true, userId: authData.user.id }
    } catch (error: any) {
        console.error('Error in createAdminUser:', error)
        return { success: false, error: error.message || 'Unknown error' }
    }
}

/**
 * Approve admin user (server-only)
 */
export async function approveAdminUser(
    userId: string,
    approvedBy: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        const { error } = await supabaseAdmin
            .from('admin_profiles')
            .update({
                is_active: true,
                approved_by: approvedBy,
                approved_at: new Date().toISOString()
            })
            .eq('user_id', userId)

        if (error) {
            console.error('Error approving admin:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in approveAdminUser:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Revoke admin access (server-only)
 */
export async function revokeAdminAccess(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        const { error } = await supabaseAdmin
            .from('admin_profiles')
            .update({ is_active: false })
            .eq('user_id', userId)

        if (error) {
            console.error('Error revoking admin access:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in revokeAdminAccess:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Delete admin user (server-only)
 * Removes the admin profile entirely
 */
export async function deleteAdminUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        const { error } = await supabaseAdmin
            .from('admin_profiles')
            .delete()
            .eq('user_id', userId)

        if (error) {
            console.error('Error deleting admin user:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteAdminUser:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get admin settings (server-only)
 */
export async function getAdminSettings(): Promise<AdminSettings | null> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        const { data, error } = await supabaseAdmin
            .from('admin_settings')
            .select('*')
            .single()

        if (error) {
            console.error('Error getting admin settings:', error)
            return null
        }

        return data as AdminSettings
    } catch (error) {
        console.error('Error in getAdminSettings:', error)
        return null
    }
}

/**
 * Update admin settings (server-only)
 */
export async function updateAdminSettings(
    updates: Partial<AdminSettings>
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        const { error } = await supabaseAdmin
            .from('admin_settings')
            .update(updates)
            .eq('id', (await getAdminSettings())?.id)

        if (error) {
            console.error('Error updating admin settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in updateAdminSettings:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Update admin profile (server-only)
 */
export async function updateAdminProfile(
    userId: string,
    updates: { display_name?: string; avatar_url?: string }
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        const { error } = await supabaseAdmin
            .from('admin_profiles')
            .update(updates)
            .eq('user_id', userId)

        if (error) {
            console.error('Error updating admin profile:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in updateAdminProfile:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get all admin users with their profile and auth data (server-only)
 */
export async function getAdminUsers(): Promise<{
    success: boolean
    data?: any[]
    error?: string
}> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        // 1. Get all admin profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('admin_profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (profilesError) {
            console.error('Error fetching admin profiles:', profilesError)
            return { success: false, error: profilesError.message }
        }

        // 2. Get all auth users
        // Note: listUsers defaults to 50 users per page. For production, might need pagination.
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

        if (usersError) {
            console.error('Error fetching auth users:', usersError)
            // Fallback: return profiles with placeholders
            return {
                success: true,
                data: profiles.map(profile => ({
                    ...profile,
                    email: 'Unknown',
                    raw_user_meta_data: {}
                }))
            }
        }

        // 3. Merge data
        const mergedUsers = profiles.map(profile => {
            const user = users.find(u => u.id === profile.user_id)
            return {
                ...profile,
                email: user?.email || 'Unknown',
                last_sign_in_at: user?.last_sign_in_at,
                raw_user_meta_data: user?.user_metadata || {}
            }
        })

        return { success: true, data: mergedUsers }
    } catch (error: any) {
        console.error('Error in getAdminUsers:', error)
        return { success: false, error: error.message }
    }
}

// ==========================================
// Admin Invite System
// ==========================================

export interface AdminInvite {
    id: string
    email: string
    role: AdminRole
    invited_by: string
    expires_at: string
    created_at: string
    token?: string // Only present when just created
    inviter_email?: string
}

/**
 * Generate a secure random token
 */
function generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash token for storage
 */
function hashInviteToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Create an admin invite
 */
export async function createAdminInvite(
    email: string,
    role: AdminRole,
    invitedByUserId: string
): Promise<{ success: boolean; error?: string; token?: string; invite?: AdminInvite }> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 1. Check if user already exists in auth.users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) return { success: false, error: 'System error checking existing users' }

    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (existingUser) {
        // Check if they are already an admin
        const { data: profile } = await supabaseAdmin
            .from('admin_profiles')
            .select('id')
            .eq('user_id', existingUser.id)
            .single()

        if (profile) return { success: false, error: 'User is already an admin' }
    }

    // 2. Check if a valid invite already exists
    const { data: existingInvites } = await supabaseAdmin
        .from('admin_invites')
        .select('*')
        .eq('email', email)
        .gt('expires_at', new Date().toISOString())

    if (existingInvites && existingInvites.length > 0) {
        return { success: false, error: 'Active invite already exists for this email' }
    }

    // 3. Generate Token
    const token = generateInviteToken()
    const tokenHash = hashInviteToken(token)
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours

    // 4. Store Invite
    const { data: invite, error: createError } = await supabaseAdmin
        .from('admin_invites')
        .insert({
            email,
            role,
            token_hash: tokenHash,
            invited_by: invitedByUserId,
            expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

    if (createError) {
        console.error('Create invite error:', createError)
        return { success: false, error: 'Failed to create invite record' }
    }

    // 5. Send Email
    const isDev = process.env.NODE_ENV === 'development'
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || (process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin` : isDev ? 'http://localhost:3000/admin' : 'https://admin.cedarelevators.com')

    // If using admin subdomain, path is just /invite/token (middleware rewrites to /admin/invite/token)
    // If fallback to base url/admin, path is /invite/token appended to it? No.
    // If adminUrl is "https://admin.cedarelevator.com", link is "https://admin.cedarelevator.com/invite/..."
    // If adminUrl is "https://cedarelevator.com/admin", link is "https://cedarelevator.com/admin/invite/..."

    // Safer logic:
    const inviteLink = `${adminUrl}/invite/${token}`

    // Get inviter email
    let inviterEmail = 'Admin'
    if (invitedByUserId) {
        const { data: inviterUser } = await supabaseAdmin.auth.admin.getUserById(invitedByUserId)
        if (inviterUser?.user?.email) inviterEmail = inviterUser.user.email
    }

    // Don't fail the whole process if email fails, but return token so it can be copied manually
    try {
        await sendAdminInviteEmail(email, role, inviteLink, inviterEmail)
    } catch (emailError) {
        console.error('Failed to send invite email:', emailError)
    }

    return {
        success: true,
        token: token, // Return raw token to caller ONE TIME
        invite
    }
}

/**
 * Revoke/Delete an invite
 */
export async function revokeAdminInvite(inviteId: string): Promise<{ success: boolean; error?: string }> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { error } = await supabaseAdmin
        .from('admin_invites')
        .delete()
        .eq('id', inviteId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

/**
 * Resend an invite (regenerate token and expiry)
 */
export async function resendAdminInvite(inviteId: string): Promise<{ success: boolean; error?: string; token?: string }> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 1. Get existing invite to verify it exists
    const { data: existingInvite, error: fetchError } = await supabaseAdmin
        .from('admin_invites')
        .select('*')
        .eq('id', inviteId)
        .single()

    if (fetchError || !existingInvite) return { success: false, error: 'Invite not found' }

    // 2. Generate New Token
    const token = generateInviteToken()
    const tokenHash = hashInviteToken(token)
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours

    // 3. Update Invite
    const { error: updateError } = await supabaseAdmin
        .from('admin_invites')
        .update({
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)

    if (updateError) return { success: false, error: 'Failed to update invite' }

    // 4. Send Email
    const isDev = process.env.NODE_ENV === 'development'
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || (process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin` : isDev ? 'http://localhost:3000/admin' : 'https://admin.cedarelevators.com')
    const inviteLink = `${adminUrl}/invite/${token}`

    // Get inviter email (original inviter)
    let inviterEmail = 'Admin'
    if (existingInvite.invited_by) {
        const { data: inviterUser } = await supabaseAdmin.auth.admin.getUserById(existingInvite.invited_by)
        if (inviterUser?.user?.email) inviterEmail = inviterUser.user.email
    }

    try {
        await sendAdminInviteEmail(existingInvite.email, existingInvite.role, inviteLink, inviterEmail)
    } catch (emailError) {
        console.error('Failed to send resend email:', emailError)
    }


    return { success: true, token }
}

/**
 * Verify an invite token
 */
export async function verifyInviteToken(token: string): Promise<{ success: boolean; invite?: AdminInvite; error?: string }> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const tokenHash = hashInviteToken(token)

    const { data: invite, error } = await supabaseAdmin
        .from('admin_invites')
        .select('*')
        .eq('token_hash', tokenHash)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

    if (error || !invite) {
        return { success: false, error: 'Invalid or expired invite' }
    }

    return { success: true, invite }
}

/**
 * Accept an invite and create the admin user
 */
export async function acceptInvite(token: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 1. Verify token again
    const { success, invite } = await verifyInviteToken(token)
    if (!success || !invite) {
        return { success: false, error: 'Invalid or expired invite' }
    }

    // 2. Handle Auth User
    let userId: string

    // Check if user already exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.find(u => u.email === invite.email)

    if (existingUser) {
        // Check if they already have an admin profile
        const { data: existingProfile } = await supabaseAdmin
            .from('admin_profiles')
            .select('id')
            .eq('user_id', existingUser.id)
            .single()

        if (existingProfile) {
            return { success: false, error: 'User already has an admin profile' }
        }

        // Check if ANY profile exists with this email (orphan profile prevention)
        const { data: emailProfile } = await supabaseAdmin
            .from('admin_profiles')
            .select('id')
            .eq('email', invite.email)
            .single()

        if (emailProfile) {
            return { success: false, error: 'An admin profile with this email already exists' }
        }

        // Orphaned auth record found - update it
        const { data: userData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
                password: password,
                user_metadata: { full_name: name },
                email_confirm: true
            }
        )

        if (updateError || !userData.user) {
            return { success: false, error: updateError?.message || 'Failed to update existing user' }
        }
        userId = userData.user.id
    } else {
        // Create new user
        const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email: invite.email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: name }
        })

        if (createUserError || !userData.user) {
            return { success: false, error: createUserError?.message || 'Failed to create user' }
        }
        userId = userData.user.id
    }

    // 3. Create Admin Profile
    const { error: profileError } = await supabaseAdmin
        .from('admin_profiles')
        .insert({
            user_id: userId,
            role: invite.role,
            display_name: name,
            is_active: true, // Auto-activate invited users
            created_at: new Date().toISOString()
        })

    if (profileError) {
        // Rollback auth user creation if profile fails? 
        // Ideally yes, but Supabase doesn't support transactions across Auth and Public easily without deeper SQL.
        // For now, we will log and return error. Manual cleanup might be needed.
        console.error('Failed to create admin profile:', profileError)
        return { success: false, error: profileError.message || 'Failed to create admin profile' }
    }

    // 4. Mark Invite as Used
    await supabaseAdmin
        .from('admin_invites')
        .update({
            used_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', invite.id)

    return { success: true }
}

/**
 * Get all pending invites
 */
export async function getAdminInvites(): Promise<{ success: boolean; data?: AdminInvite[]; error?: string }> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Fetch invites
    const { data: invites, error } = await supabaseAdmin
        .from('admin_invites')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message }

    // Fetch inviter emails manually since we can't join on auth.users directly via standard client easily without foreign tables setup sometimes
    // But we can just list users and map. For a small admin list, this is fine.
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

    const enrichedInvites = invites.map(invite => ({
        ...invite,
        inviter_email: users.find(u => u.id === invite.invited_by)?.email
    }))

    return { success: true, data: enrichedInvites }
}