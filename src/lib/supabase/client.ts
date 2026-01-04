import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create browser client for admin auth (using @supabase/ssr)
export function createClient() {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and Key are required. Check your environment variables.')
    }
    return createBrowserClient(supabaseUrl, supabaseKey)
}

// Create a dummy client during build time if env vars are not available
export const supabase = supabaseUrl && supabaseKey
    ? createClient()
    : null

// Helper to get the client (throws if not available)
export function getSupabaseClient() {
    if (!supabase) {
        throw new Error('Supabase client not initialized. Check your environment variables.')
    }
    return supabase
}


