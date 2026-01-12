/**
 * Enterprise-Grade Quote Number Generator
 * 
 * Format: CED-QT-{TYPE}-{YYMMDD}-{SEQ}
 * Example: CED-QT-BZ-260112-000123
 * 
 * User Type Codes:
 * - GS: Guest
 * - IN: Individual
 * - BZ: Business (Unverified)
 * - BV: Business (Verified)
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { UserType } from '@/types/b2b/quote'

/**
 * Maps user account type to 2-letter code
 */
export function getUserTypeCode(accountType: UserType | null | undefined): string {
    switch (accountType) {
        case 'guest':
        case null:
        case undefined:
            return 'GS'
        case 'individual':
            return 'IN'
        case 'business':
            return 'BZ'
        case 'verified':
            return 'BV'
        default:
            return 'GS' // Fallback to guest
    }
}

/**
 * Formats date as YYMMDD
 */
export function formatQuoteDate(date: Date = new Date()): string {
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}${month}${day}`
}

/**
 * Generates enterprise-grade quote number with transaction safety
 * 
 * @param accountType - User account type
 * @returns Promise<string> - Formatted quote number (e.g., CED-QT-BZ-260112-000123)
 * @throws Error if database operation fails
 */
export async function generateQuoteNumber(
    accountType: UserType | null | undefined
): Promise<string> {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
        throw new Error('Database connection failed')
    }

    // Get user type code
    const typeCode = getUserTypeCode(accountType)

    // Get current date (YYYY-MM-DD for SQL)
    const today = new Date()
    const sqlDate = today.toISOString().split('T')[0]

    // Call database function to atomically increment counter
    const { data, error } = await supabase.rpc('increment_quote_counter', {
        p_date: sqlDate,
        p_user_type: typeCode
    })

    if (error) {
        console.error('Quote number generation error:', error)
        throw new Error(`Failed to generate quote number: ${error.message}`)
    }

    if (data === null || data === undefined) {
        throw new Error('Quote counter returned null')
    }

    // Format sequence number with 6-digit padding
    const sequence = data.toString().padStart(6, '0')

    // Format date as YYMMDD
    const dateStr = formatQuoteDate(today)

    // Build final quote number
    const quoteNumber = `CED-QT-${typeCode}-${dateStr}-${sequence}`

    return quoteNumber
}

/**
 * Validates quote number format
 */
export function validateQuoteNumber(quoteNumber: string): boolean {
    // Format: CED-QT-{TYPE}-{YYMMDD}-{SEQ}
    const pattern = /^CED-QT-(GS|IN|BZ|BV)-\d{6}-\d{6}$/
    return pattern.test(quoteNumber)
}

/**
 * Parses quote number to extract components
 */
export function parseQuoteNumber(quoteNumber: string): {
    prefix: string
    typeCode: string
    date: string
    sequence: string
} | null {
    const pattern = /^(CED-QT)-(GS|IN|BZ|BV)-(\d{6})-(\d{6})$/
    const match = quoteNumber.match(pattern)

    if (!match) return null

    return {
        prefix: match[1],
        typeCode: match[2],
        date: match[3],
        sequence: match[4]
    }
}
