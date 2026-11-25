/**
 * Authoritative Cedar Elevators Quote Number Generator
 * Format: CED-QT-{TYPE}-{YYMMDD}-{SEQ}
 * Uses IST (Asia/Kolkata) date and atomic DB counter RPC increment_quote_counter.
 */

import { createAdminClient } from '@/lib/supabase/server'
import type { UserType } from '@/types/b2b/quote'

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
      return 'GS'
  }
}

function getIstDateParts(date: Date = new Date()): { sqlDate: string; yyMmDd: string } {
  const istString = date.toLocaleString('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const sqlDate = istString.slice(0, 10) // YYYY-MM-DD
  const yyMmDd = sqlDate.slice(2, 4) + sqlDate.slice(5, 7) + sqlDate.slice(8, 10)
  return { sqlDate, yyMmDd }
}

export function formatQuoteDate(date: Date = new Date()): string {
  return getIstDateParts(date).yyMmDd
}

export async function generateQuoteNumber(
  accountType: UserType | null | undefined = 'guest'
): Promise<string> {
  const supabase = createAdminClient()
  const typeCode = getUserTypeCode(accountType)
  const { sqlDate, yyMmDd } = getIstDateParts(new Date())

  const { data, error } = await supabase.rpc('increment_quote_counter', {
    p_date: sqlDate,
    p_user_type: typeCode,
  })

  if (error || data === null || data === undefined) {
    console.error('[QuoteNumberGenerator] RPC error:', error)
    throw new Error(`Failed to generate quote number: ${error?.message || 'null counter'}`)
  }

  const sequence = data.toString().padStart(6, '0')
  return `CED-QT-${typeCode}-${yyMmDd}-${sequence}`
}

export function validateQuoteNumber(quoteNumber: string): boolean {
  return /^CED-QT-(GS|IN|BZ|BV)-\d{6}-\d{6}$/.test(quoteNumber)
}

export function parseQuoteNumber(quoteNumber: string): {
  prefix: string
  typeCode: string
  date: string
  sequence: string
} | null {
  const match = quoteNumber.match(/^(CED-QT)-(GS|IN|BZ|BV)-(\d{6})-(\d{6})$/)
  if (!match) return null
  return {
    prefix: match[1],
    typeCode: match[2],
    date: match[3],
    sequence: match[4],
  }
}
