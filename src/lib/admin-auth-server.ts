import { createServerSupabase } from './supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminProfile, type AdminProfile, type AdminSettings, type AdminRole } from './admin-auth-client'

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