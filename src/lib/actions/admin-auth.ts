'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import {
    getAdminProfile,
    verifySetupKey,
    generateRecoveryKey,
    hashRecoveryKey,
    verifyRecoveryKey,
    isSuperAdmin,
    type AdminRole
} from '@/lib/admin-auth-client'
import {
    isSetupCompleted,
    createAdminUser,
    getAdminSettings,
    updateAdminSettings,
    approveAdminUser,
    revokeAdminAccess,
    getCurrentAdmin
} from '@/lib/admin-auth-server'
import { revalidatePath } from 'next/cache'

/**
 * Admin Login Action
 * Validates credentials and checks admin profile
 */
export async function adminLoginAction(email: string, password: string) {
    try {
        console.log('[Admin Login] Starting login for:', email)

        // Check environment variables
        console.log('[Admin Login] Environment check:', {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            nodeEnv: process.env.NODE_ENV
        })

        const supabase = await createServerSupabase()

        // Sign in with Supabase Auth
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (signInError || !data.user) {
            console.log('[Admin Login] Sign in failed:', signInError?.message)
            return {
                success: false,
                error: 'Invalid credentials'
            }
        }

        console.log('[Admin Login] Sign in successful, user ID:', data.user.id)

        // Check if user has admin profile
        const adminProfile = await getAdminProfile(data.user.id)
        console.log('[Admin Login] Admin profile:', adminProfile)

        if (!adminProfile) {
            console.log('[Admin Login] No admin profile found')
            // Sign out the user
            await supabase.auth.signOut()
            return {
                success: false,
                error: 'Unauthorized - No admin profile'
            }
        }

        // Check if admin is active
        if (!adminProfile.is_active) {
            console.log('[Admin Login] Admin not active')
            // Don't sign out - allow them to see pending page
            return {
                success: false,
                error: 'Access not approved',
                pending: true
            }
        }

        console.log('[Admin Login] Login successful, role:', adminProfile.role)
        return {
            success: true,
            role: adminProfile.role,
            userId: data.user.id
        }
    } catch (error: any) {
        console.error('[Admin Login] Exception caught:', error)
        console.error('[Admin Login] Error stack:', error.stack)
        return {
            success: false,
            error: 'Login failed: ' + error.message
        }
    }
}

/**
 * Admin Setup Action (First-Time Only)
 * Creates super admin and sets up the system
 */
export async function adminSetupAction(
    email: string,
    password: string,
    setupKey: string
) {
    try {
        // Check if setup is already completed
        const setupCompleted = await isSetupCompleted()
        if (setupCompleted) {
            return {
                success: false,
                error: 'Setup has already been completed.'
            }
        }

        // Verify setup key
        if (!verifySetupKey(setupKey)) {
            return {
                success: false,
                error: 'Invalid setup key.'
            }
        }

        // Generate recovery key
        const recoveryKey = generateRecoveryKey()
        const recoveryKeyHash = hashRecoveryKey(recoveryKey)

        // Create super admin user (automatically active)
        const result = await createAdminUser(email, password, 'super_admin', '')

        if (!result.success) {
            return {
                success: false,
                error: result.error || 'Failed to create super admin.'
            }
        }

        // Update admin settings
        await updateAdminSettings({
            setup_completed: true,
            recovery_key_hash: recoveryKeyHash
        })

        return {
            success: true,
            recoveryKey, // Return recovery key to show once
            userId: result.userId
        }
    } catch (error: any) {
        console.error('Admin setup error:', error)
        return {
            success: false,
            error: 'An unexpected error occurred during setup.'
        }
    }
}

/**
 * Admin Recovery Action
 * Allows super admin to recover access
 */
export async function adminRecoveryAction(
    email: string,
    recoveryKey: string
) {
    try {
        // Get admin settings
        const settings = await getAdminSettings()

        if (!settings?.recovery_key_hash) {
            return {
                success: false,
                error: 'Recovery not configured.'
            }
        }

        // Verify recovery key
        if (!verifyRecoveryKey(recoveryKey, settings.recovery_key_hash)) {
            return {
                success: false,
                error: 'Invalid recovery key.'
            }
        }

        // Get user by email using service role
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        // Find user by email
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

        if (usersError) {
            return {
                success: false,
                error: 'Failed to verify admin user.'
            }
        }

        const user = users.find(u => u.email === email)

        if (!user) {
            return {
                success: false,
                error: 'Admin user not found.'
            }
        }

        // Check if user is super admin
        const isSuperAdminUser = await isSuperAdmin(user.id)

        if (!isSuperAdminUser) {
            return {
                success: false,
                error: 'Recovery is only available for super admin users.'
            }
        }

        // Generate new password reset token
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email
        })

        if (resetError || !resetData) {
            return {
                success: false,
                error: 'Failed to generate recovery link.'
            }
        }

        // In production, you might want to send this via email
        // For now, return the reset link
        return {
            success: true,
            resetLink: resetData.properties.action_link,
            message: 'Recovery successful. Use the provided link to reset your password.'
        }
    } catch (error: any) {
        console.error('Admin recovery error:', error)
        return {
            success: false,
            error: 'An unexpected error occurred during recovery.'
        }
    }
}

/**
 * Create Admin User Action
 * Only accessible to super admins
 */
export async function createAdminUserAction(
    email: string,
    role: AdminRole,
    temporaryPassword: string
) {
    try {
        const supabase = await createServerSupabase()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return {
                success: false,
                error: 'Not authenticated.'
            }
        }

        // Check if current user is super admin
        const isSuperAdminUser = await isSuperAdmin(user.id)

        if (!isSuperAdminUser) {
            return {
                success: false,
                error: 'Only super admins can create admin users.'
            }
        }

        // Create admin user
        const result = await createAdminUser(email, temporaryPassword, role, user.id)

        if (!result.success) {
            return {
                success: false,
                error: result.error
            }
        }

        revalidatePath('/admin/settings/users')

        return {
            success: true,
            userId: result.userId,
            message: 'Admin user created successfully. They must be approved before accessing the system.'
        }
    } catch (error: any) {
        console.error('Create admin user error:', error)
        return {
            success: false,
            error: 'An unexpected error occurred.'
        }
    }
}

/**
 * Approve Admin User Action
 */
export async function approveAdminAction(userId: string) {
    try {
        const supabase = await createServerSupabase()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return {
                success: false,
                error: 'Not authenticated.'
            }
        }

        // Check if current user is super admin
        const isSuperAdminUser = await isSuperAdmin(user.id)

        if (!isSuperAdminUser) {
            return {
                success: false,
                error: 'Only super admins can approve admin users.'
            }
        }

        const result = await approveAdminUser(userId, user.id)

        if (!result.success) {
            return {
                success: false,
                error: result.error
            }
        }

        revalidatePath('/admin/settings/users')

        return {
            success: true,
            message: 'Admin user approved successfully.'
        }
    } catch (error: any) {
        console.error('Approve admin error:', error)
        return {
            success: false,
            error: 'An unexpected error occurred.'
        }
    }
}

/**
 * Revoke Admin Access Action
 */
export async function revokeAdminAction(userId: string) {
    try {
        const supabase = await createServerSupabase()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return {
                success: false,
                error: 'Not authenticated.'
            }
        }

        // Check if current user is super admin
        const isSuperAdminUser = await isSuperAdmin(user.id)

        if (!isSuperAdminUser) {
            return {
                success: false,
                error: 'Only super admins can revoke admin access.'
            }
        }

        // Prevent self-revocation
        if (user.id === userId) {
            return {
                success: false,
                error: 'You cannot revoke your own access.'
            }
        }

        const result = await revokeAdminAccess(userId)

        if (!result.success) {
            return {
                success: false,
                error: result.error
            }
        }

        revalidatePath('/admin/settings/users')

        return {
            success: true,
            message: 'Admin access revoked successfully.'
        }
    } catch (error: any) {
        console.error('Revoke admin error:', error)
        return {
            success: false,
            error: 'An unexpected error occurred.'
        }
    }
}

/**
 * Get Current Admin Action
 * Returns the current admin user and profile
 */
export async function getCurrentAdminAction() {
    try {
        const admin = await getCurrentAdmin()

        if (!admin) {
            return {
                success: false,
                error: 'Not authenticated'
            }
        }

        return {
            success: true,
            user: admin.user,
            profile: admin.profile
        }
    } catch (error: any) {
        console.error('Get current admin error:', error)
        return {
            success: false,
            error: 'An unexpected error occurred.'
        }
    }
}

/**
 * Check Setup Status Action
 */
export async function checkSetupStatusAction() {
    try {
        const completed = await isSetupCompleted()
        return { success: true, setupCompleted: completed }
    } catch (error) {
        return { success: false, setupCompleted: false }
    }
}
