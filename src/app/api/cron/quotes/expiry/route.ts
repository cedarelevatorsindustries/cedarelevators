import { NextResponse } from 'next/server'
import { expireOverdueQuotes } from '@/lib/actions/admin-quotes'

/**
 * API Route for Quote Expiry Cron Job
 * 
 * This endpoint should be called daily (e.g., at 00:00) to auto-expire
 * quotes that have passed their 'valid_until' date.
 * 
 * Security: 
 * For production, you should add a CRON_SECRET check to ensure 
 * only authorized services (like Vercel Cron or GitHub Actions) can call this.
 */
export async function GET(request: Request) {
    try {
        // Optional: Basic authentication check
        const authHeader = request.headers.get('authorization')
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[Cron] Starting daily quote expiry check...')

        const result = await expireOverdueQuotes()

        console.log(`[Cron] Quote expiry check completed. Expired ${result.count} quotes.`)

        return NextResponse.json({
            success: true,
            expiredCount: result.count,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('[Cron Error] Failed to process quote expiry:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 })
    }
}
