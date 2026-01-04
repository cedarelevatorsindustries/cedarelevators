'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Verify Supabase connection and check table counts
 * This is a helper function for debugging
 */
export async function verifySupabaseConnection() {
    try {
        const supabase = createServerSupabaseClient()
        
        if (!supabase) {
            return {
                success: false,
                error: 'Supabase client could not be created. Check environment variables.'
            }
        }

        // Test connection by fetching counts from all tables
        const results = await Promise.allSettled([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('*', { count: 'exact', head: true }),
            supabase.from('quotes').select('*', { count: 'exact', head: true }),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            supabase.from('customer_meta').select('*', { count: 'exact', head: true }),
            supabase.from('admin_activity_logs').select('*', { count: 'exact', head: true }),
        ])

        const tables = ['products', 'orders', 'quotes', 'categories', 'customer_meta', 'admin_activity_logs']
        const tableStatus: Record<string, any> = {}

        results.forEach((result, index) => {
            const tableName = tables[index]
            if (result.status === 'fulfilled') {
                const { count, error } = result.value
                tableStatus[tableName] = {
                    connected: !error,
                    count: count || 0,
                    error: error?.message
                }
            } else {
                tableStatus[tableName] = {
                    connected: false,
                    count: 0,
                    error: result.reason?.message || 'Unknown error'
                }
            }
        })

        return {
            success: true,
            tables: tableStatus,
            envCheck: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            }
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Unknown error occurred'
        }
    }
}

