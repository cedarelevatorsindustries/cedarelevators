'use client'

import { createClient } from '@/lib/supabase/client'
import { adminLogoutAction } from '@/lib/actions/admin-auth'

/**
 * Centralized Admin Sign Out Utility
 * 
 * 1. Calls supabase.auth.signOut() on browser client to purge local storage and in-memory tokens.
 * 2. Calls adminLogoutAction() server action to purge SSR cookies on the server response.
 * 3. Navigates to /admin/ and refreshes page to clear all client caches (TanStack Query, state).
 */
export async function performAdminLogout(options?: {
    redirectPath?: string
    onComplete?: () => void
}) {
    try {
        const supabase = createClient()
        await supabase.auth.signOut()
    } catch (err) {
        console.warn('[performAdminLogout] Browser sign out warning:', err)
    }

    try {
        await adminLogoutAction()
    } catch (err) {
        console.warn('[performAdminLogout] Server sign out warning:', err)
    }

    if (options?.onComplete) {
        options.onComplete()
    }

    const target = options?.redirectPath || '/admin'
    
    // In browser environment, navigate to target and force state reload
    if (typeof window !== 'undefined') {
        window.location.href = target
    }
}
