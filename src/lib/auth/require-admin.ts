import { createServerSupabase, createAdminClient } from '@/lib/supabase/server'
import type { AdminRole } from '@/types/b2b/quote'

export type { AdminRole }

/**
 * Authoritative admin role hierarchy
 */
export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  staff: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
}

/**
 * Check if user's role meets or exceeds the required role in the hierarchy
 */
export function hasRolePermission(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0)
}

export interface AdminUserRecord {
  id: string              // Profile UUID (admin_profiles.id)
  user_id: string         // Supabase Auth UUID (auth.users.id)
  email: string           // Verified email from auth.users
  full_name: string | null// display_name
  display_name: string | null
  name?: string | null    // Compatibility alias for full_name / display_name
  clerk_user_id?: string  // Legacy compatibility alias mapping to Supabase user_id
  role: AdminRole
  is_active: boolean
  avatar_url?: string | null
}

export type RequireAdminResult =
  | { authorized: true; adminUser: AdminUserRecord }
  | { authorized: false; error: string; status: number }

/**
 * Validates that the current request is from an authenticated Supabase Auth administrator
 * who possesses an active record in public.admin_profiles matching their Supabase Auth UUID.
 *
 * Enforces role hierarchy: staff (1) < manager (2) < admin (3) < super_admin (4).
 * 
 * Rejects unauthenticated requests with 401 Unauthorized.
 * Rejects non-admin or inactive users with 403 Forbidden.
 * Rejects users with insufficient role privileges with 403 Forbidden.
 */
export async function requireAdmin(minRole: AdminRole = 'staff'): Promise<RequireAdminResult> {
  try {
    // 1. Retrieve current Supabase Auth session server-side
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        authorized: false,
        error: 'Unauthorized: Authentication required',
        status: 401
      }
    }

    // 2. Query admin_profiles exclusively by the authenticated user's Supabase UUID
    // Attempt with the authenticated SSR client first
    let profile = null
    const { data: userProfile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('id, user_id, role, is_active, display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      // In case of RLS recursion or permission issue on admin_profiles table,
      // fallback to reading profile via service-role for the already cryptographically verified user.id
      console.warn('[requireAdmin] RLS error on admin_profiles, querying via admin client:', profileError.message)
      const adminClient = createAdminClient()
      const { data: serviceProfile, error: serviceError } = await adminClient
        .from('admin_profiles')
        .select('id, user_id, role, is_active, display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle()

      if (serviceError) {
        console.error('[requireAdmin] Database error querying admin profile:', serviceError)
        return {
          authorized: false,
          error: 'Internal authorization error',
          status: 500
        }
      }
      profile = serviceProfile
    } else {
      profile = userProfile
    }

    // 3. User has no admin profile record
    if (!profile) {
      return {
        authorized: false,
        error: 'Forbidden: Admin privileges required',
        status: 403
      }
    }

    // 4. Verify admin account is active
    if (!profile.is_active) {
      return {
        authorized: false,
        error: 'Forbidden: Administrator account is inactive',
        status: 403
      }
    }

    // 5. Verify role hierarchy against the required minimum role
    const userRole = profile.role as AdminRole
    if (!hasRolePermission(userRole, minRole)) {
      return {
        authorized: false,
        error: 'Forbidden: Insufficient administrator privileges',
        status: 403
      }
    }

    // 6. Return verified, strongly-typed admin record
    return {
      authorized: true,
      adminUser: {
        id: profile.id,
        user_id: profile.user_id,
        email: user.email || '',
        full_name: profile.display_name || null,
        display_name: profile.display_name || null,
        name: profile.display_name || null,
        clerk_user_id: profile.user_id,
        role: userRole,
        is_active: profile.is_active,
        avatar_url: profile.avatar_url || null
      }
    }
  } catch (err: any) {
    console.error('[requireAdmin] Error verifying admin access:', err)
    return {
      authorized: false,
      error: 'Internal authorization error',
      status: 500
    }
  }
}
