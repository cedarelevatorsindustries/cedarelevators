'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { requireAdmin, type AdminUserRecord } from '@/lib/auth/require-admin'
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
    getCurrentAdmin,
    updateAdminProfile,
    getAdminUsers,
    createAdminInvite,
    revokeAdminInvite,
    resendAdminInvite,
    getAdminInvites,
    acceptInvite,
    verifyInviteToken,
    deleteAdminUser
} from '@/lib/admin-auth-server'
import { revalidatePath } from 'next/cache'

/**
 * Admin Login Action
 * Validates credentials via Supabase Auth and authoritatively verifies
 * administrator status using requireAdmin('staff').
 */
export async function adminLoginAction(email: string, password: string) {
    try {
        // 1. Input Validation
        if (!email || typeof email !== 'string' || !email.trim()) {
            return {
                success: false,
                error: 'Email address is required.'
            }
        }

        const cleanEmail = email.trim().toLowerCase()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(cleanEmail)) {
            return {
                success: false,
                error: 'Please enter a valid email address.'
            }
        }

        if (!password || typeof password !== 'string' || password.length === 0) {
            return {
                success: false,
                error: 'Password is required.'
            }
        }

        const supabase = await createServerSupabase()

        // 2. Sign in with Supabase Auth
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
        })

        if (signInError || !data.user) {
            return {
                success: false,
                error: 'Invalid email or password.'
            }
        }

        // 3. Authoritative Server-Side Authorization Check via requireAdmin()
        // Validates UUID against public.admin_profiles, role hierarchy, and active status
        const authResult = await requireAdmin('staff')

        if (!authResult.authorized) {
            // Immediately purge session to prevent lingering cookies for non-admins
            await supabase.auth.signOut()

            if (authResult.error?.toLowerCase().includes('inactive')) {
                return {
                    success: false,
                    error: 'Your administrator account is inactive or pending approval.',
                    pending: true
                }
            }

            return {
                success: false,
                error: 'Access denied: Administrator privileges required.'
            }
        }

        return {
            success: true,
            role: authResult.adminUser.role,
            userId: authResult.adminUser.user_id,
            displayName: authResult.adminUser.display_name
        }
    } catch (error: any) {
        console.error('[Admin Login] Login exception:', error.message)
        return {
            success: false,
            error: 'An unexpected error occurred during login. Please try again.'
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

        // Security: Dispatch recovery link to the verified email rather than exposing raw action link in HTTP response
        let adminOrigin = 'http://localhost:3000'
        if (process.env.ADMIN_DOMAIN) {
            const domain = process.env.ADMIN_DOMAIN.replace(/^https?:\/\//, '')
            adminOrigin = `https://${domain}`
        } else if (process.env.NEXT_PUBLIC_APP_URL) {
            adminOrigin = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
        }

        const supabase = await createServerSupabase()
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${adminOrigin}/api/admin/auth/callback?next=/admin/reset-password`
        })

        if (resetError) {
            console.error('Admin recovery email error:', resetError)
            return {
                success: false,
                error: 'Failed to send recovery email.'
            }
        }

        return {
            success: true,
            message: 'Recovery key verified. Password reset instructions have been dispatched to the super-admin email address.'
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
 * Authoritative Server Session Verification for Admin Portal
 * Uses requireAdmin('staff') to cryptographically verify user and check admin_profiles
 */
export async function checkAdminSessionAction(): Promise<{
    status: 'authenticated' | 'unauthenticated' | 'unauthorized' | 'inactive'
    user?: {
        id: string
        email: string
    }
    admin?: {
        id: string
        role: AdminRole
        display_name: string | null
        is_active: boolean
    }
    error?: string
}> {
    try {
        const res = await requireAdmin('staff')
        if (res.authorized) {
            return {
                status: 'authenticated',
                user: {
                    id: res.adminUser.user_id,
                    email: res.adminUser.email
                },
                admin: {
                    id: res.adminUser.id,
                    role: res.adminUser.role,
                    display_name: res.adminUser.display_name,
                    is_active: res.adminUser.is_active
                }
            }
        }

        if (res.status === 401) {
            return {
                status: 'unauthenticated',
                error: res.error
            }
        }

        if (res.error?.toLowerCase().includes('inactive')) {
            return {
                status: 'inactive',
                error: res.error
            }
        }

        return {
            status: 'unauthorized',
            error: res.error
        }
    } catch (err: any) {
        console.error('[checkAdminSessionAction] error:', err)
        return {
            status: 'unauthenticated',
            error: err.message
        }
    }
}

/**
 * Admin Logout Action
 * Signs out of Supabase Auth server session
 */
export async function adminLogoutAction() {
    try {
        const supabase = await createServerSupabase()
        await supabase.auth.signOut()
        return { success: true }
    } catch (err: any) {
        console.error('[adminLogoutAction] error:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Request Administrator Password Recovery via Email
 * Sends a password reset email using Supabase Auth.
 * Generic response prevents email enumeration attacks.
 */
export async function adminRequestPasswordRecoveryAction(email: string) {
    try {
        if (!email || typeof email !== 'string' || !email.trim()) {
            return {
                success: false,
                error: 'Email address is required.'
            }
        }

        const cleanEmail = email.trim().toLowerCase()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(cleanEmail)) {
            return {
                success: false,
                error: 'Please enter a valid email address.'
            }
        }

        // Determine base URL dynamically based on environment configuration
        let adminOrigin = 'http://localhost:3000'
        if (process.env.ADMIN_DOMAIN) {
            const domain = process.env.ADMIN_DOMAIN.replace(/^https?:\/\//, '')
            adminOrigin = `https://${domain}`
        } else if (process.env.NEXT_PUBLIC_APP_URL) {
            adminOrigin = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
        }

        const redirectTo = `${adminOrigin}/api/admin/auth/callback?next=/admin/reset-password`

        const supabase = await createServerSupabase()
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo
        })

        if (error) {
            console.error('[adminRequestPasswordRecoveryAction] Supabase error:', error.message)
        }

        // Generic response: Never expose whether the email exists or belongs to an administrator
        return {
            success: true,
            message: 'If an administrator account exists with this email address, password reset instructions have been sent.'
        }
    } catch (err: any) {
        console.error('[adminRequestPasswordRecoveryAction] Exception:', err)
        return {
            success: true,
            message: 'If an administrator account exists with this email address, password reset instructions have been sent.'
        }
    }
}

/**
 * Reset Administrator Password
 * Updates the authenticated recovery session with a new password via Supabase Auth.
 */
export async function adminResetPasswordAction(password: string) {
    try {
        if (!password || typeof password !== 'string' || password.length < 8) {
            return {
                success: false,
                error: 'Password must be at least 8 characters long.'
            }
        }

        const supabase = await createServerSupabase()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return {
                success: false,
                error: 'Your password reset session is invalid or has expired. Please request a new recovery link.'
            }
        }

        // Update the user's password in Supabase Auth
        const { error: updateError } = await supabase.auth.updateUser({
            password
        })

        if (updateError) {
            return {
                success: false,
                error: updateError.message || 'Failed to update password.'
            }
        }

        // Sign out of recovery session so admin logs in cleanly with new credentials
        await supabase.auth.signOut()

        return {
            success: true,
            message: 'Your password has been successfully updated. You can now sign in with your new password.'
        }
    } catch (err: any) {
        console.error('[adminResetPasswordAction] Exception:', err)
        return {
            success: false,
            error: 'An unexpected error occurred while resetting your password.'
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

/**
 * Update Admin Profile Action
 */
export async function updateAdminProfileAction(
    data: { display_name?: string; avatar_url?: string }
) {
    try {
        const admin = await getCurrentAdminAction()
        if (!admin.success || !admin.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const result = await updateAdminProfile(admin.user.id, data)
        if (!result.success) {
            return { success: false, error: result.error }
        }

        revalidatePath('/admin/settings/profile')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Upload Admin Avatar Action
 */
export async function uploadAdminAvatarAction(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file) return { success: false, error: 'No file uploaded' }

        const admin = await getCurrentAdminAction()
        if (!admin.success || !admin.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        const fileExt = file.name.split('.').pop()
        const fileName = `${admin.user.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('avatars')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            return { success: false, error: uploadError.message }
        }

        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('avatars')
            .getPublicUrl(filePath)

        return { success: true, publicUrl }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Get Admin Users List Action
 */
export async function getAdminUsersAction() {
    try {
        const supabase = await createServerSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' }
        }

        return await getAdminUsers()
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ==========================================
// Admin Invite Actions
// ==========================================

/**
 * Invite Admin User Action
 */
export async function inviteAdminUserAction(
    email: string,
    role: AdminRole
) {
    try {
        const admin = await getCurrentAdminAction()
        if (!admin.success || !admin.user) return { success: false, error: 'Not authenticated' }

        // Only super admin and admin can invite? 
        // Logic: Super Admin can invite anyone. Admin can invite Manager/Staff.
        // For now, let's restrict to Super Admin for safety, or check hierarchy.
        // Let's implement hierarchy check:
        const isSuper = admin.profile?.role === 'super_admin'

        // As per user request: "Admin: Full product... Cannot manage admin users" 
        // So ONLY Super Admin can invite.
        if (!isSuper) return { success: false, error: 'Only Super Admins can invite users.' }

        const result = await createAdminInvite(email, role, admin.user.id)

        if (result.success) {
            revalidatePath('/admin/settings/users')
        }

        return result
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Get Admin Invites Action
 */
export async function getAdminInvitesAction() {
    try {
        const admin = await getCurrentAdminAction()
        if (!admin.success || !admin.user) return { success: false, error: 'Not authenticated' }

        // Only Super Admin can view invites? Or maybe let admins see them?
        // Let's stick to Super Admin for user management as per rules.
        if (admin.profile?.role !== 'super_admin') {
            return { success: false, error: 'Unauthorized to view invites' }
        }

        return await getAdminInvites()
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Revoke Admin Invite Action
 */
export async function revokeAdminInviteAction(inviteId: string) {
    try {
        const admin = await getCurrentAdminAction()
        if (!admin.success || !admin.user) return { success: false, error: 'Not authenticated' }

        if (admin.profile?.role !== 'super_admin') {
            return { success: false, error: 'Unauthorized to revoke invites' }
        }

        const result = await revokeAdminInvite(inviteId)

        if (result.success) {
            revalidatePath('/admin/settings/users')
        }

        return result
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Resend Admin Invite Action
 */
export async function resendAdminInviteAction(inviteId: string) {
    try {
        const admin = await getCurrentAdminAction()
        if (!admin.success || !admin.user) return { success: false, error: 'Not authenticated' }

        if (admin.profile?.role !== 'super_admin') {
            return { success: false, error: 'Unauthorized to resend invites' }
        }

        const result = await resendAdminInvite(inviteId)

        if (result.success) {
            revalidatePath('/admin/settings/users')
        }

        return result
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Accept Admin Invite Action
 * Public access - no auth required
 */
export async function acceptAdminInviteAction(
    token: string,
    password: string,
    name: string
) {
    try {
        const result = await acceptInvite(token, password, name)
        return result
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteAdminUserAction(userId: string) {
    const admin = await getCurrentAdmin()
    if (!admin?.profile || admin.profile.role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Only Super Admins can delete users' }
    }

    // Prevent deleting self (just partial safety, UI should handle too)
    if (admin.user.id === userId) {
        return { success: false, error: 'Cannot delete your own account' }
    }

    try {
        const result = await deleteAdminUser(userId)
        revalidatePath('/admin/settings/users')
        return result
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

