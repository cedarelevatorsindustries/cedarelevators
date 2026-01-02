
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateIdentityData() {
    console.log('Starting identity data migration...')

    try {
        // 1. Get all unique users from quotes table (legacy data source)
        // Note: This assumes quotes used to store clerk_id in user_id column or similar
        // Adjust based on actual legacy schema

        // In this specific case, we might be starting fresh or have mixed data.
        // The safest bet is to rely on the new auth-sync service to populate users on login.
        // However, if we need to backfill from existing quotes that have a clerk_id:

        // Example: Fetch quotes with string user_ids that look like Clerk IDs (user_...)
        const { data: quotes, error: quotesError } = await supabase
            .from('quotes')
            .select('user_id, email, phone, bill_to_address_id')
            .not('user_id', 'is', null)

        if (quotesError) throw quotesError

        console.log(`Found ${quotes?.length || 0} quotes to analyze`)

        if (!quotes) return

        // Group by user_id to find unique users
        const uniqueUsers = new Map()
        quotes.forEach(q => {
            // enhanced check for Clerk ID format
            if (typeof q.user_id === 'string' && q.user_id.startsWith('user_')) {
                if (!uniqueUsers.has(q.user_id)) {
                    uniqueUsers.set(q.user_id, {
                        clerk_id: q.user_id,
                        email: q.email, // might be null in quotes
                        phone: q.phone
                    })
                }
            }
        })

        console.log(`Found ${uniqueUsers.size} unique users to migrate`)

        // Insert users and profiles
        for (const [clerkId, userData] of uniqueUsers) {
            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('clerk_user_id', clerkId)
                .single()

            if (existingUser) {
                console.log(`User ${clerkId} already exists, skipping`)
                continue
            }

            console.log(`Migrating user ${clerkId}...`)

            // Create user
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    clerk_user_id: clerkId,
                    email: userData.email || `imported_${clerkId}@example.com`, // Fallback
                    phone: userData.phone,
                    name: 'Imported User'
                })
                .select()
                .single()

            if (createError) {
                console.error(`Failed to create user ${clerkId}:`, createError)
                continue
            }

            // Create individual profile
            await supabase
                .from('user_profiles')
                .insert({
                    user_id: newUser.id,
                    profile_type: 'individual',
                    is_active: true
                })

            console.log(`Successfully migrated user ${clerkId}`)
        }

        console.log('Migration complete!')

    } catch (error) {
        console.error('Migration failed:', error)
    }
}

migrateIdentityData()
