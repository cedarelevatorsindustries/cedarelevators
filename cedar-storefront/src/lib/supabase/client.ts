import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a dummy client during build time if env vars are not available
export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

// Helper to get the client (throws if not available)
export function getSupabaseClient() {
    if (!supabase) {
        throw new Error('Supabase client not initialized. Check your environment variables.')
    }
    return supabase
}
