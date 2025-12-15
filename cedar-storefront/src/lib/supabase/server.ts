import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Export vanilla createClient for non-auth contexts if needed, or alias
export { createClient } from '@supabase/supabase-js'

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
        // Get the Supabase token from Clerk
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({ template: 'supabase' })

          const headers = new Headers(options?.headers)
          headers.set('Authorization', `Bearer ${clerkToken}`)

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
