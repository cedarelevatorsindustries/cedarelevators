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

