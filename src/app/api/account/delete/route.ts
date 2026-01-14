import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
    try {
        const { userId: authUserId } = await auth()

        if (!authUserId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { userId, scheduledDeletionDate } = body

        // Verify the user is deleting their own account
        if (authUserId !== userId) {
            return NextResponse.json(
                { error: 'You can only delete your own account' },
                { status: 403 }
            )
        }

        const supabase = await createClerkSupabaseClient()

        // 1. Mark user profile for deletion in database
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                scheduled_deletion_date: scheduledDeletionDate,
                is_deleted: false, // Will be set to true after 30 days
                deletion_requested_at: new Date().toISOString(),
            })
            .eq('id', userId)

        if (updateError) {
            console.error('Error marking profile for deletion:', updateError)
            return NextResponse.json(
                { error: 'Failed to schedule account deletion' },
                { status: 500 }
            )
        }

        // 2. Mark business profile for deletion if exists
        await supabase
            .from('businesses')
            .update({
                scheduled_deletion_date: scheduledDeletionDate,
                is_deleted: false,
                deletion_requested_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

        // 3. Update Clerk user metadata to indicate pending deletion
        const clerk = await clerkClient()
        await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
                accountStatus: 'pending_deletion',
                scheduledDeletionDate: scheduledDeletionDate,
            },
        })

        // 4. Sign out user from Clerk (sessions will be invalidated)
        // Note: The actual sign out happens on the client side

        return NextResponse.json({
            success: true,
            message: 'Account scheduled for deletion',
            scheduledDeletionDate,
        })
    } catch (error: any) {
        console.error('Account deletion error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// Endpoint to permanently delete accounts past their retention period
// This should be called by a scheduled job/cron
export async function DELETE(request: NextRequest) {
    try {
        // Verify this is an authorized system call (e.g., from cron job)
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const supabase = await createClerkSupabaseClient()
        const now = new Date().toISOString()

        // Find all accounts past their scheduled deletion date
        const { data: accountsToDelete, error: fetchError } = await supabase
            .from('user_profiles')
            .select('id, clerk_user_id')
            .lt('scheduled_deletion_date', now)
            .eq('is_deleted', false)
            .not('scheduled_deletion_date', 'is', null)

        if (fetchError) {
            console.error('Error fetching accounts to delete:', fetchError)
            return NextResponse.json(
                { error: 'Failed to fetch accounts' },
                { status: 500 }
            )
        }

        const deletedAccounts = []
        const clerk = await clerkClient()

        for (const account of accountsToDelete || []) {
            try {
                // 1. Delete from Clerk
                await clerk.users.deleteUser(account.clerk_user_id)

                // 2. Mark as deleted in database (or actually delete)
                await supabase
                    .from('user_profiles')
                    .update({ is_deleted: true })
                    .eq('id', account.id)

                await supabase
                    .from('businesses')
                    .update({ is_deleted: true })
                    .eq('user_id', account.id)

                deletedAccounts.push(account.id)
            } catch (deleteError) {
                console.error(`Failed to delete account ${account.id}:`, deleteError)
            }
        }

        return NextResponse.json({
            success: true,
            deletedCount: deletedAccounts.length,
            deletedAccounts,
        })
    } catch (error: any) {
        console.error('Batch deletion error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
