import { auth, currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

export interface AdminUserRecord {
  id: string
  clerk_user_id: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
}

export type RequireAdminResult =
  | { authorized: true; adminUser: AdminUserRecord }
  | { authorized: false; error: string; status: number }

/**
 * Validates that the current request is from an authenticated Clerk user
 * who possesses an active record in the public.admin_users database table.
 * 
 * Rejects unauthenticated users with 401 Unauthorized.
 * Rejects authenticated non-admin users with 403 Forbidden.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { authorized: false, error: 'Unauthorized: Authentication required', status: 401 }
    }

    const supabase = createAdminClient()

    // 1. Direct lookup by clerk_user_id
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, clerk_user_id, email, full_name, role, is_active')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .single()

    if (adminUser) {
      return { authorized: true, adminUser }
    }

    // 2. Resilient fallback: Match active admin by verified primary email
    const user = await currentUser()
    const primaryEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()

    if (primaryEmail) {
      const { data: adminByEmail } = await supabase
        .from('admin_users')
        .select('id, clerk_user_id, email, full_name, role, is_active')
        .eq('email', primaryEmail)
        .eq('is_active', true)
        .single()

      if (adminByEmail) {
        // Link clerk_user_id automatically if previously unlinked or rotated
        if (adminByEmail.clerk_user_id !== userId) {
          await supabase
            .from('admin_users')
            .update({ clerk_user_id: userId })
            .eq('id', adminByEmail.id)
        }
        return {
          authorized: true,
          adminUser: { ...adminByEmail, clerk_user_id: userId }
        }
      }
    }

    return { authorized: false, error: 'Forbidden: Admin privileges required', status: 403 }
  } catch (err: any) {
    console.error('[requireAdmin] Error verifying admin access:', err)
    return { authorized: false, error: 'Internal authorization error', status: 500 }
  }
}
