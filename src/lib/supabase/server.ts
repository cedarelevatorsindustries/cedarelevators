import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Export vanilla createClient for non-auth contexts if needed, or alias
export { createClient } from '@supabase/supabase-js'

/**
 * Create a server-side Supabase client with cookie-based auth
 * Used for admin panel authentication (separate from Clerk store auth)
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createClerkSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required. Check your environment variables.')
  }

  const { getToken } = await auth()

  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        // Use standard Clerk session token (native integration - NO template!)
        fetch: async (url, options = {}) => {
          // Get standard Clerk token without template (Native Integration method)
          const clerkToken = await getToken()

          const headers = new Headers(options?.headers)
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
          } else {
            console.warn('createClerkSupabaseClient: No Clerk token found. Request will be anonymous.')
          }

          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    }
  )
}

// Create a server-side Supabase client without auth (for public data)
export function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Create a Supabase client with Service Role access (Admin)
 * Use ONLY in secure server-side contexts (API routes, Server Actions)
 * Bypasses Row Level Security (RLS)
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing')
    throw new Error('Supabase Service Role Key is required for admin operations')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}


