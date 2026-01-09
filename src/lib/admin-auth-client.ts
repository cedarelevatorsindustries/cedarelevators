import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Admin role hierarchy
export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'staff'

export interface AdminProfile {
    id: string
    user_id: string
    role: AdminRole
    is_active: boolean
    approved_by: string | null
    approved_at: string | null
    created_at: string
    updated_at: string
    display_name?: string | null
    avatar_url?: string | null
}

export interface AdminSettings {
    id: string
    setup_completed: boolean
    recovery_key_hash: string | null
    created_at: string
    updated_at: string
    singleton_guard: boolean
}

/**
 * Generate a secure recovery key
 * Returns a 32-character alphanumeric key
 */
export function generateRecoveryKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars
    const length = 32
    const randomBytes = crypto.randomBytes(length)

    let key = ''
    for (let i = 0; i < length; i++) {
        key += chars[randomBytes[i] % chars.length]
    }

    // Format as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
    return key.match(/.{1,4}/g)?.join('-') || key
}

/**
 * Hash a recovery key using SHA-256
 */
export function hashRecoveryKey(key: string): string {
    return crypto
        .createHash('sha256')
        .update(key.replace(/-/g, '')) // Remove dashes before hashing
        .digest('hex')
}

/**
 * Verify a recovery key against its hash
 */
export function verifyRecoveryKey(key: string, hash: string): boolean {
    const inputHash = hashRecoveryKey(key)
    return inputHash === hash
}

/**
 * Verify setup key
 */
export function verifySetupKey(inputKey: string): boolean {
    const setupKey = process.env.ADMIN_SETUP_KEY

    if (!setupKey) {
        console.error('ADMIN_SETUP_KEY not configured')
        return false
    }

    return inputKey === setupKey
}

/**
 * Role hierarchy check
 * Returns true if userRole has permission over targetRole
 */
export function hasRolePermission(userRole: AdminRole, targetRole: AdminRole): boolean {
    const hierarchy: Record<AdminRole, number> = {
        super_admin: 4,
        admin: 3,
        manager: 2,
        staff: 1
    }

    return hierarchy[userRole] >= hierarchy[targetRole]
}

/**
 * Get admin profile for a user (client-safe version)
 * Uses service role to bypass RLS for reliable profile fetching
 */
export async function getAdminProfile(userId: string): Promise<AdminProfile | null> {
    try {
        // Use service role client to bypass RLS policies
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!serviceRoleKey) {
            console.error('[getAdminProfile] Service role key not configured')
            return null
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        const { data, error } = await supabaseAdmin
            .from('admin_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) {
            console.error('[getAdminProfile] Query error:', error)
            return null
        }

        if (!data) {
            return null
        }
        return data as AdminProfile
    } catch (error) {
        console.error('[getAdminProfile] Exception:', error)
        return null
    }
}

/**
 * Check if user is an active admin
 */
export async function isActiveAdmin(userId: string): Promise<boolean> {
    const profile = await getAdminProfile(userId)
    return profile?.is_active === true
}

/**
 * Check if user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
    const profile = await getAdminProfile(userId)
    return profile?.role === 'super_admin' && profile?.is_active === true
}
